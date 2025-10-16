import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Loader2, File, X } from "lucide-react";

interface FileUploadSectionProps {
  caseId: string;
  onUploadComplete: () => void;
}

export function FileUploadSection({ caseId, onUploadComplete }: FileUploadSectionProps) {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error("File too large. Maximum size is 20MB.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !docType) {
      toast.error("Please select a file and document type");
      return;
    }

    setUploading(true);
    try {
      // Create Dropbox path
      const timestamp = Date.now();
      const dropboxPath = `/CASES/${caseId}/uploads/${timestamp}_${selectedFile.name}`;

      // Insert document record
      const { error: dbError } = await supabase.from("documents").insert({
        case_id: caseId,
        name: selectedFile.name,
        dropbox_path: dropboxPath,
        type: docType,
        category: category || "client_upload",
        file_size: selectedFile.size,
        file_extension: selectedFile.name.split('.').pop() || '',
        ocr_status: 'pending',
        metadata: {
          uploaded_by: 'client',
          upload_source: 'client_portal',
          original_filename: selectedFile.name,
        },
      });

      if (dbError) throw dbError;

      toast.success("Document uploaded successfully!");
      setSelectedFile(null);
      setDocType("");
      setCategory("");
      onUploadComplete();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file">Select File (Max 20MB)</Label>
          <div className="flex gap-2">
            <Input
              id="file"
              type="file"
              onChange={handleFileSelect}
              disabled={uploading}
              className="cursor-pointer"
            />
            {selectedFile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedFile(null)}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {selectedFile && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <File className="h-4 w-4" />
              <span>{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="docType">Document Type</Label>
          <Select value={docType} onValueChange={setDocType} disabled={uploading}>
            <SelectTrigger id="docType">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="birth_certificate">Birth Certificate</SelectItem>
              <SelectItem value="marriage_certificate">Marriage Certificate</SelectItem>
              <SelectItem value="passport">Passport</SelectItem>
              <SelectItem value="naturalization">Naturalization Papers</SelectItem>
              <SelectItem value="id_document">ID Document</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category (Optional)</Label>
          <Select value={category} onValueChange={setCategory} disabled={uploading}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="applicant">Applicant</SelectItem>
              <SelectItem value="spouse">Spouse</SelectItem>
              <SelectItem value="father">Father</SelectItem>
              <SelectItem value="mother">Mother</SelectItem>
              <SelectItem value="other_family">Other Family</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleUpload} 
          disabled={uploading || !selectedFile || !docType}
          className="w-full"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
