import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Loader2, File, X } from "lucide-react";
import { DocumentPreviewModal } from "@/components/modals/DocumentPreviewModal";

interface FileUploadSectionProps {
  caseId: string;
  onUploadComplete: () => void;
}

export function FileUploadSection({ caseId, onUploadComplete }: FileUploadSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [docType, setDocType] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [classifying, setClassifying] = useState(false);
  const [aiClassification, setAiClassification] = useState<{
    documentType: string;
    personType: string;
    confidence: number;
    reasoning: string;
  } | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (50MB limit)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 20MB.");
      return;
    }

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedFile(file);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setSelectedFile(null);
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile) return;
    await performUpload();
  };

  const performUpload = async () => {
    if (!selectedFile || !docType) {
      toast.error("Please select a file and document type");
      return;
    }

    setUploading(true);
    try {
      // Convert file to base64 for OCR processing
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });
      
      const imageBase64 = await base64Promise;
      const timestamp = Date.now();
      const dropboxPath = `/CASES/${caseId}/uploads/${timestamp}_${selectedFile.name}`;

      // 1. Create document record
      const { data: newDoc, error: dbError } = await supabase
        .from("documents")
        .insert({
          case_id: caseId,
          name: selectedFile.name,
          dropbox_path: dropboxPath,
          type: docType,
          category: category || "client_upload",
          file_size: selectedFile.size,
          file_extension: selectedFile.name.split('.').pop() || '',
          ocr_status: 'processing',
          metadata: {
            uploaded_by: 'client',
            upload_source: 'client_portal',
            original_filename: selectedFile.name,
          },
        })
        .select()
        .single();

      if (dbError) throw dbError;

      toast.success("Document uploaded! AI is analyzing...");

      // 2. Run Universal OCR with full translation and organization
      setClassifying(true);
      const { data: ocrResult, error: ocrError } = await supabase.functions.invoke('ocr-universal', {
        body: {
          imageBase64,
          documentId: newDoc.id,
          caseId,
          documentType: docType || undefined,
          personType: undefined
        }
      });

      if (ocrError) {
        console.error('Universal OCR error:', ocrError);
        toast.warning('Document saved but OCR processing failed');
        setClassifying(false);
      } else if (ocrResult?.data) {
        const result = ocrResult.data;
        const confidence = (result.confidence?.overall * 100).toFixed(0);
        
        setAiClassification({
          documentType: result.extracted_data?.document_type || 'unknown',
          personType: result.extracted_data?.person_type || 'unknown',
          confidence: result.confidence?.overall || 0,
          reasoning: result.description?.full_description || ''
        });
        
        const personLabels: Record<string, string> = {
          AP: 'Applicant',
          F: 'Father',
          M: 'Mother',
          PGF: 'Paternal Grandfather',
          PGM: 'Paternal Grandmother',
          MGF: 'Maternal Grandfather',
          MGM: 'Maternal Grandmother',
          SPOUSE: 'Spouse'
        };

        const detectedLanguage = result.detected_language;
        const needsTranslation = ocrResult.needsSwornTranslation;
        
        toast.success(
          `✅ ${personLabels[result.extracted_data?.person_type]}'s ${result.extracted_data?.document_type?.replace('_', ' ')} (${confidence}% confident)${needsTranslation ? ' - Needs certified translation' : ''}`,
          { duration: 8000 }
        );

        // Show translation info if available
        if (detectedLanguage !== 'POLISH' && result.translations?.polish) {
          toast.info(
            `🌐 Translated from ${detectedLanguage} to Polish & English`,
            { duration: 5000 }
          );
        }

        setClassifying(false);

        // 3. Organize document in Dropbox structure
        supabase.functions.invoke('organize-dropbox', {
          body: {
            documentId: newDoc.id,
            caseId,
            clientCode: 'CLIENT' // TODO: Get actual client code from case
          }
        }).then(({ data: orgResult, error: orgError }) => {
          // Document organization completed (errors are non-critical)
        });
      }

      // 4. Clear file from browser memory immediately
      setSelectedFile(null);
      setShowPreview(false);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setDocType("");
      setCategory("");
      setAiClassification(null);
      onUploadComplete();
      
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          {/* DASHBOARD-UX-SAFE: Improved title sizing for mobile */}
          <CardTitle className="text-lg sm:text-xl">Upload Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file" className="text-sm">Select File (Max 20MB)</Label>
            {/* DASHBOARD-UX-SAFE: Improved file input layout for mobile */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="file"
                type="file"
                onChange={handleFileSelect}
                disabled={uploading}
                className="cursor-pointer flex-1"
              />
              {selectedFile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFile(null)}
                  disabled={uploading}
                  className="flex-shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            {selectedFile && (
              // DASHBOARD-UX-SAFE: Truncate long filenames on mobile
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <File className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="docType" className="text-sm">Document Type (Optional - AI will detect)</Label>
            <Select value={docType} onValueChange={setDocType} disabled={uploading}>
              <SelectTrigger id="docType">
                <SelectValue placeholder="AI will detect automatically" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="birth_certificate">Birth Certificate</SelectItem>
                <SelectItem value="marriage_certificate">Marriage Certificate</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="naturalization">Naturalization Papers</SelectItem>
                <SelectItem value="death_certificate">Death Certificate</SelectItem>
                <SelectItem value="military_record">Military Record</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {aiClassification && (
            // DASHBOARD-UX-SAFE: Improved AI classification display for mobile
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded space-y-2">
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-foreground">
                    ✅ AI Detection ({(aiClassification.confidence * 100).toFixed(0)}% confident)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                    {aiClassification.reasoning}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* DASHBOARD-UX-SAFE: Improved info box for mobile readability */}
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded text-xs sm:text-sm text-muted-foreground space-y-2">
            <p><strong className="text-foreground">✨ AI-Powered:</strong> Upload any document in ANY language (Polish, Russian, German, English, Yiddish, etc.) and our AI will:</p>
            <ul className="list-disc list-inside ml-2 space-y-1 text-xs sm:text-sm">
              <li>Automatically identify whose document it is (Applicant, Father, Grandfather, etc.)</li>
              <li>Detect the document type (birth cert, marriage cert, naturalization, etc.)</li>
              <li>Translate to Polish and English instantly</li>
              <li>Organize it in the correct folder</li>
              <li>Handle old handwritten documents from 1800s-1900s</li>
            </ul>
            <p className="text-xs"><strong className="text-foreground">🔒 Security:</strong> Your document is processed securely with OCR for 5 minutes maximum, then immediately deleted from our servers. Original files remain safely on Dropbox.</p>
          </div>
        </CardContent>
      </Card>

      <DocumentPreviewModal
        isOpen={showPreview}
        onClose={handleClosePreview}
        onConfirm={handleConfirmUpload}
        file={selectedFile}
        previewUrl={previewUrl}
        isUploading={uploading}
      />
    </>
  );
}
