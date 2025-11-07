import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileIcon, X } from "lucide-react";
import { useState } from "react";

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  file: File | null;
  previewUrl: string | null;
  isUploading?: boolean;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  onConfirm,
  file,
  previewUrl,
  isUploading = false,
}: DocumentPreviewModalProps) {
  const [imageError, setImageError] = useState(false);

  const isImage = file?.type.startsWith('image/');
  const isPDF = file?.type === 'application/pdf';

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Preview Document</DialogTitle>
          <DialogDescription>
            Review your document before uploading to Dropbox
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-4">
          {/* File Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <FileIcon className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium truncate">{file?.name}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Size: {file ? formatFileSize(file.size) : 'Unknown'}
            </div>
          </div>

          {/* Preview Area */}
          <div className="border rounded-lg p-4 bg-background min-h-[400px] flex items-center justify-center">
            {isImage && previewUrl && !imageError ? (
              <img
                src={previewUrl}
                alt="Document preview"
                className="max-w-full max-h-[500px] object-contain rounded"
                onError={() => setImageError(true)}
              />
            ) : isPDF && previewUrl ? (
              <div className="w-full h-[500px]">
                <iframe
                  src={previewUrl}
                  className="w-full h-full rounded border-0"
                  title="PDF preview"
                />
              </div>
            ) : (
              <div className="text-center space-y-2">
                <FileIcon className="h-16 w-16 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">
                  Preview not available for this file type
                </p>
                <p className="text-xs text-muted-foreground">
                  {file?.type || 'Unknown type'}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUploading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Confirm & Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
