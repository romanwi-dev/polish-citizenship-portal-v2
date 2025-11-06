import { useState, useRef } from "react";
import { z } from "zod";
import { Upload, X, FileIcon, Image as ImageIcon, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Security validation schema
const fileSchema = z.object({
  name: z.string().max(255, "Filename too long"),
  size: z.number()
    .max(50 * 1024 * 1024, "File must be less than 50MB")
    .positive("Invalid file size"),
  type: z.string().refine(
    (type) => {
      const allowedTypes = [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/webp',
        'application/pdf',
      ];
      return allowedTypes.includes(type);
    },
    { message: "Only JPG, PNG, WEBP, and PDF files are allowed" }
  ),
});

interface FilePreview {
  file: File;
  preview?: string;
  isValid: boolean;
  error?: string;
}

interface FileUploadWithPreviewProps {
  onUpload: (files: File[]) => Promise<void>;
  uploading: boolean;
  caseId?: string;
}

export function FileUploadWithPreview({ onUpload, uploading, caseId }: FileUploadWithPreviewProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const [showPreviews, setShowPreviews] = useState(false);

  const validateAndPreviewFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const newPreviews: FilePreview[] = [];

    Array.from(files).forEach((file) => {
      // Client-side validation using zod schema
      const validation = fileSchema.safeParse({
        name: file.name,
        size: file.size,
        type: file.type,
      });

      if (!validation.success) {
        const errorMessage = validation.error.errors[0]?.message || "Invalid file";
        newPreviews.push({
          file,
          isValid: false,
          error: errorMessage,
        });
        
        toast({
          title: `Invalid file: ${file.name}`,
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      // Create preview for images
      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }

      newPreviews.push({
        file,
        preview,
        isValid: true,
      });
    });

    setPreviews(newPreviews);
    setShowPreviews(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    validateAndPreviewFiles(event.target.files);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    validateAndPreviewFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const removeFile = (index: number) => {
    setPreviews(prev => {
      const newPreviews = [...prev];
      // Revoke object URL to prevent memory leaks
      if (newPreviews[index].preview) {
        URL.revokeObjectURL(newPreviews[index].preview!);
      }
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleUpload = async () => {
    const validFiles = previews.filter(p => p.isValid).map(p => p.file);
    
    if (validFiles.length === 0) {
      toast({
        title: "No valid files",
        description: "Please select valid files to upload",
        variant: "destructive",
      });
      return;
    }

    await onUpload(validFiles);
    
    // Clear previews after successful upload
    previews.forEach(p => {
      if (p.preview) URL.revokeObjectURL(p.preview);
    });
    setPreviews([]);
    setShowPreviews(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validCount = previews.filter(p => p.isValid).length;
  const invalidCount = previews.length - validCount;

  if (!caseId) {
    return (
      <Card className="p-8 text-center border-2 border-dashed border-muted-foreground/30">
        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-muted-foreground">Please select a case first to upload documents</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <Card
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={cn(
          "p-8 border-2 border-dashed transition-all cursor-pointer hover:border-primary/50",
          uploading && "opacity-50 pointer-events-none"
        )}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="text-center">
          <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop files here or click to browse
          </p>
          <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
            <Badge variant="outline">JPG/JPEG</Badge>
            <Badge variant="outline">PNG</Badge>
            <Badge variant="outline">WEBP</Badge>
            <Badge variant="outline">PDF</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Maximum file size: 50MB</p>
        </div>
      </Card>

      {/* Previews */}
      {showPreviews && previews.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Eye className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">File Preview ({previews.length})</h3>
              {invalidCount > 0 && (
                <Badge variant="destructive">{invalidCount} invalid</Badge>
              )}
            </div>
            <Button
              onClick={() => {
                previews.forEach(p => {
                  if (p.preview) URL.revokeObjectURL(p.preview);
                });
                setPreviews([]);
                setShowPreviews(false);
              }}
              variant="ghost"
              size="sm"
            >
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
            {previews.map((preview, index) => (
              <Card
                key={index}
                className={cn(
                  "relative p-3 group",
                  !preview.isValid && "border-red-500/50 bg-red-500/5"
                )}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute -top-2 -right-2 z-10 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>

                <div className="aspect-square bg-muted rounded-md mb-2 overflow-hidden flex items-center justify-center">
                  {preview.preview ? (
                    <img
                      src={preview.preview}
                      alt={preview.file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileIcon className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>

                <p className="text-xs truncate font-medium">{preview.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(preview.file.size / 1024).toFixed(0)} KB
                </p>

                {!preview.isValid && preview.error && (
                  <p className="text-xs text-red-500 mt-1">{preview.error}</p>
                )}
              </Card>
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleUpload}
              disabled={uploading || validCount === 0}
              className="flex-1"
            >
              {uploading ? (
                <>Processing {validCount} file(s)...</>
              ) : (
                <>Upload {validCount} valid file(s)</>
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
