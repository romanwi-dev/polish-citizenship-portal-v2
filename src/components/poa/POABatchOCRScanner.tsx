import { useState, useRef } from "react";
import { Upload, CheckCircle, AlertCircle, Loader2, X, FileStack } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface POABatchOCRScannerProps {
  caseId: string;
  onBatchComplete?: (results: OCRBatchResult[]) => void;
  maxFiles?: number;
}

interface FileStatus {
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
  documentType: 'other';
  documentId?: string;
}

interface OCRBatchResult {
  fileName: string;
  success: boolean;
  documentType: string;
  confidence?: number;
  documentId?: string;
  error?: string;
}

const detectDocumentType = (fileName: string): 'other' => {
  // Let AI (ocr-universal) detect document type automatically
  return 'other';
};

export const POABatchOCRScanner = ({ 
  caseId, 
  onBatchComplete,
  maxFiles = 10 
}: POABatchOCRScannerProps) => {
  const [files, setFiles] = useState<Map<string, FileStatus>>(new Map());
  const [processing, setProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (file.size > 20 * 1024 * 1024) {
      return { valid: false, error: "File too large (max 20MB)" };
    }

    const validTypes = [
      'image/jpeg', 'image/png', 'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: "Invalid file type" };
    }

    return { valid: true };
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    
    if (selectedFiles.length + files.size > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const newFiles = new Map(files);
    
    selectedFiles.forEach(file => {
      const validation = validateFile(file);
      
      if (!validation.valid) {
        toast.error(`${file.name}: ${validation.error}`);
        return;
      }

      const fileId = `${file.name}-${Date.now()}`;
      newFiles.set(fileId, {
        file,
        status: 'pending',
        progress: 0,
        documentType: detectDocumentType(file.name)
      });
    });

    setFiles(newFiles);
    toast.success(`${selectedFiles.length} file(s) added`);
  };

  const removeFile = (fileId: string) => {
    const newFiles = new Map(files);
    newFiles.delete(fileId);
    setFiles(newFiles);
  };

  const updateFileStatus = (fileId: string, updates: Partial<FileStatus>) => {
    setFiles(prev => {
      const newFiles = new Map(prev);
      const existing = newFiles.get(fileId);
      if (existing) {
        newFiles.set(fileId, { ...existing, ...updates });
      }
      return newFiles;
    });
  };

  const processSingleFile = async (fileId: string, fileStatus: FileStatus) => {
    try {
      // 1. Upload to Dropbox
      updateFileStatus(fileId, { progress: 25 });
      const uploadFormData = new FormData();
      uploadFormData.append('file', fileStatus.file);
      uploadFormData.append('caseId', caseId);
      uploadFormData.append('documentType', fileStatus.documentType);

      const { data: uploadResult, error: uploadError } = await supabase.functions.invoke('upload-to-dropbox', {
        body: uploadFormData,
      });

      if (uploadError) throw uploadError;

      // 2. Process OCR
      updateFileStatus(fileId, { progress: 50 });
      const ocrFormData = new FormData();
      ocrFormData.append('file', fileStatus.file);
      ocrFormData.append('documentType', fileStatus.documentType);

      const { data: ocrResult, error: ocrError } = await supabase.functions.invoke('ocr-universal', {
        body: ocrFormData,
      });

      if (ocrError) throw ocrError;

      // 3. Create document record
      updateFileStatus(fileId, { progress: 75 });
      const { data: doc, error: docError } = await supabase
        .from('documents')
        .insert({
          case_id: caseId,
          name: uploadResult.filename || fileStatus.file.name,
          dropbox_path: uploadResult.dropboxPath,
          file_extension: uploadResult.filename?.split('.').pop() || fileStatus.file.name.split('.').pop(),
          document_type: ocrResult.extracted_data?.document_type || fileStatus.documentType,
          person_type: ocrResult.extracted_data?.person_type || 'AP',
          ocr_data: ocrResult.extracted_data || ocrResult,
          ocr_confidence: ocrResult.confidence,
          ocr_status: 'completed',
        })
        .select()
        .single();

      if (docError) throw docError;

      // 4. Apply OCR data to master_table
      updateFileStatus(fileId, { progress: 90 });
      const { error: applyError } = await supabase.functions.invoke('apply-ocr-to-forms', {
        body: {
          documentId: doc.id,
          caseId,
          overwriteManual: false,
        },
      });

      if (applyError) throw applyError;

      updateFileStatus(fileId, { 
        status: 'completed', 
        progress: 100,
        result: ocrResult,
        documentId: doc.id
      });

      return {
        success: true,
        confidence: ocrResult.confidence || 0,
        result: ocrResult,
        documentType: fileStatus.documentType,
        documentId: doc.id,
      };
    } catch (error) {
      console.error(`Error processing ${fileStatus.file.name}:`, error);
      updateFileStatus(fileId, { 
        status: 'failed', 
        progress: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        documentType: fileStatus.documentType,
      };
    }
  };

  const handleProcessBatch = async () => {
    if (files.size === 0) {
      toast.error("Please select files to process");
      return;
    }

    setProcessing(true);
    setOverallProgress(0);

    try {
      const fileEntries = Array.from(files.entries());
      const batchSize = 3; // Process 3 files in parallel
      const results: OCRBatchResult[] = [];
      
      // Process files in batches
      for (let i = 0; i < fileEntries.length; i += batchSize) {
        const batch = fileEntries.slice(i, i + batchSize);
        
        const batchPromises = batch.map(([fileId, fileStatus]) => 
          processSingleFile(fileId, fileStatus)
        );
        
        const batchResults = await Promise.all(batchPromises);
        
        // Map to OCRBatchResult
        batch.forEach(([fileId, fileStatus], idx) => {
          const result = batchResults[idx];
          results.push({
            fileName: fileStatus.file.name,
            success: result.success,
            documentType: result.documentType,
            confidence: result.confidence,
            documentId: result.documentId,
            error: result.error,
          });
        });
        
        // Update overall progress
        const progress = Math.round(((i + batch.length) / fileEntries.length) * 100);
        setOverallProgress(progress);
      }

      // Summary
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      if (successful > 0) {
        toast.success(`Batch complete: ${successful} successful, ${failed} failed`);
      } else {
        toast.error(`Batch failed: ${failed} files had errors`);
      }

      if (onBatchComplete) {
        onBatchComplete(results);
      }

      // Store batch patterns in OCR memory
      await supabase.functions.invoke('ocr-memory-agent', {
        body: {
          action: 'store_batch_patterns',
          patternData: {
            batchResults: results.map(r => ({
              success: r.success,
              confidence: r.confidence || 0,
              documentType: r.documentType,
            })),
          },
        },
      });

    } catch (error) {
      console.error('Batch processing error:', error);
      toast.error("Batch processing failed");
    } finally {
      setProcessing(false);
      setOverallProgress(100);
    }
  };

  const pendingCount = Array.from(files.values()).filter(f => f.status === 'pending').length;
  const completedCount = Array.from(files.values()).filter(f => f.status === 'completed').length;
  const failedCount = Array.from(files.values()).filter(f => f.status === 'failed').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileStack className="w-5 h-5" />
          Batch OCR Scanner
        </CardTitle>
        <CardDescription>
          Upload multiple documents and process them in parallel
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*,application/pdf,.doc,.docx"
          onChange={handleFileSelect}
          disabled={processing}
          multiple
        />
        <p className="text-xs text-muted-foreground">
          Max {maxFiles} files, 20MB each
        </p>

        {processing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} />
          </div>
        )}

        {files.size > 0 && (
          <div className="flex gap-4 text-sm">
            <Badge variant="outline">Total: {files.size}</Badge>
            {pendingCount > 0 && <Badge variant="secondary">Pending: {pendingCount}</Badge>}
            {completedCount > 0 && <Badge className="bg-green-500">Completed: {completedCount}</Badge>}
            {failedCount > 0 && <Badge variant="destructive">Failed: {failedCount}</Badge>}
          </div>
        )}

        {files.size > 0 && (
          <ScrollArea className="h-[300px] border rounded-lg p-4">
            <div className="space-y-2">
              {Array.from(files.entries()).map(([fileId, fileStatus]) => (
                <div key={fileId} className="flex items-center gap-3 p-3 border rounded-lg">
                  {fileStatus.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {fileStatus.status === 'processing' && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                  {fileStatus.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-500" />}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{fileStatus.file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(fileStatus.file.size / 1024 / 1024).toFixed(2)}MB
                    </p>
                    {fileStatus.status === 'processing' && (
                      <Progress value={fileStatus.progress} className="h-1 mt-1" />
                    )}
                    {fileStatus.error && (
                      <p className="text-xs text-red-500 mt-1">{fileStatus.error}</p>
                    )}
                  </div>

                  {!processing && fileStatus.status === 'pending' && (
                    <Button variant="ghost" size="sm" onClick={() => removeFile(fileId)}>
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        <Button
          onClick={handleProcessBatch}
          disabled={files.size === 0 || processing}
          className="w-full"
          size="lg"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing {completedCount} of {files.size}...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Process {files.size} File{files.size !== 1 ? 's' : ''}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
