import { useState, useRef, useCallback } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, X, FileStack } from "lucide-react";
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

interface OCRResult {
  confidence: number;
  extracted_data: Record<string, any>;
  document_type: string;
}

interface FileStatus {
  file: File;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: OCRResult;
  error?: string;
  documentType: 'passport' | 'birth_certificate' | 'other';
}

interface OCRBatchResult {
  fileName: string;
  success: boolean;
  documentType: string;
  result?: OCRResult;
  error?: string;
}

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
    // Validate file size (max 20MB)
    if (file.size > 20 * 1024 * 1024) {
      return { valid: false, error: "File too large. Maximum size is 20MB." };
    }

    // Validate file type
    const validTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/heic',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: "Invalid file type." };
    }

    return { valid: true };
  };

  const detectDocumentType = (fileName: string): 'passport' | 'birth_certificate' | 'other' => {
    const lower = fileName.toLowerCase();
    if (lower.includes('passport') || lower.includes('pass')) {
      return 'passport';
    }
    if (lower.includes('birth') || lower.includes('cert')) {
      return 'birth_certificate';
    }
    return 'other';
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

  const processOCR = async (
    file: File, 
    documentType: 'passport' | 'birth_certificate' | 'other'
  ): Promise<OCRResult> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          
          // Use appropriate OCR function based on type
          const functionName = documentType === 'passport' 
            ? 'ocr-passport' 
            : 'ocr-universal';
          
          const { data, error } = await supabase.functions.invoke(functionName, {
            body: {
              imageBase64: base64,
              caseId,
              expectedType: documentType,
            },
          });

          if (error) throw error;

          if (data?.success) {
            resolve(data.data);
          } else {
            throw new Error('OCR processing failed');
          }
        } catch (err) {
          reject(err);
        }
      };
      
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
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

  const processSingleFile = async (fileId: string, fileStatus: FileStatus): Promise<OCRBatchResult> => {
    updateFileStatus(fileId, { status: 'processing', progress: 10 });

    try {
      updateFileStatus(fileId, { progress: 30 });
      
      const result = await processOCR(fileStatus.file, fileStatus.documentType);
      
      updateFileStatus(fileId, { 
        status: 'completed', 
        progress: 100,
        result 
      });

      return {
        fileName: fileStatus.file.name,
        success: true,
        documentType: fileStatus.documentType,
        result
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'OCR processing failed';
      
      updateFileStatus(fileId, { 
        status: 'failed', 
        progress: 0,
        error: errorMessage 
      });

      return {
        fileName: fileStatus.file.name,
        success: false,
        documentType: fileStatus.documentType,
        error: errorMessage
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
        results.push(...batchResults);
        
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

      // Store results in OCR memory agent
      await supabase.functions.invoke('ocr-memory-agent', {
        body: {
          action: 'store_batch_patterns',
          caseId,
          batchResults: results
        }
      });

    } catch (error) {
      console.error('Batch processing error:', error);
      toast.error("Batch processing failed");
    } finally {
      setProcessing(false);
      setOverallProgress(100);
    }
  };

  const getStatusColor = (status: FileStatus['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-muted';
    }
  };

  const getStatusIcon = (status: FileStatus['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing': return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <FileText className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const pendingCount = Array.from(files.values()).filter(f => f.status === 'pending').length;
  const completedCount = Array.from(files.values()).filter(f => f.status === 'completed').length;
  const failedCount = Array.from(files.values()).filter(f => f.status === 'failed').length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileStack className="w-5 h-5" />
            Batch OCR Scanner
          </CardTitle>
          <CardDescription>
            Upload multiple documents (passports, birth certificates, etc.) and process them in parallel
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf,.doc,.docx"
              onChange={handleFileSelect}
              disabled={processing}
              multiple
            />
            <p className="text-xs text-muted-foreground">
              Maximum {maxFiles} files, 20MB each. Supports images, PDFs, and documents.
            </p>
          </div>

          {/* Progress Bar */}
          {processing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} />
            </div>
          )}

          {/* Summary Stats */}
          {files.size > 0 && (
            <div className="flex gap-4 text-sm">
              <Badge variant="outline">
                Total: {files.size}
              </Badge>
              {pendingCount > 0 && (
                <Badge variant="secondary">
                  Pending: {pendingCount}
                </Badge>
              )}
              {completedCount > 0 && (
                <Badge className="bg-green-500">
                  Completed: {completedCount}
                </Badge>
              )}
              {failedCount > 0 && (
                <Badge variant="destructive">
                  Failed: {failedCount}
                </Badge>
              )}
            </div>
          )}

          {/* File List */}
          {files.size > 0 && (
            <ScrollArea className="h-[300px] border rounded-lg p-4">
              <div className="space-y-2">
                {Array.from(files.entries()).map(([fileId, fileStatus]) => (
                  <div
                    key={fileId}
                    className="flex items-center gap-3 p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                  >
                    {getStatusIcon(fileStatus.status)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">
                          {fileStatus.file.name}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {fileStatus.documentType}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {(fileStatus.file.size / 1024 / 1024).toFixed(2)}MB
                      </p>
                      {fileStatus.status === 'processing' && (
                        <Progress value={fileStatus.progress} className="h-1 mt-1" />
                      )}
                      {fileStatus.error && (
                        <p className="text-xs text-red-500 mt-1">{fileStatus.error}</p>
                      )}
                      {fileStatus.result && (
                        <p className="text-xs text-green-600 mt-1">
                          {(fileStatus.result.confidence * 100).toFixed(0)}% confidence
                        </p>
                      )}
                    </div>

                    {!processing && fileStatus.status === 'pending' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(fileId)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {/* Process Button */}
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

      {/* Results Summary */}
      {completedCount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Extraction Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Array.from(files.values())
                .filter(f => f.status === 'completed' && f.result)
                .map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm font-medium">{f.file.name}</span>
                    <div className="flex items-center gap-2">
                      <Badge className={f.result!.confidence >= 0.85 ? "bg-green-500" : "bg-yellow-500"}>
                        {(f.result!.confidence * 100).toFixed(0)}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {Object.keys(f.result!.extracted_data).length} fields
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
