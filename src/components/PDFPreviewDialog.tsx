import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, Printer, Eye } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PDFPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  formData?: any;
  onRegeneratePDF?: (updatedData: any) => Promise<void>;
  onDownload: () => void;
  documentTitle: string;
}

export function PDFPreviewDialog({
  open,
  onClose,
  pdfUrl,
  formData,
  onRegeneratePDF,
  onDownload,
  documentTitle
}: PDFPreviewDialogProps) {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);
    const iframe = document.querySelector('iframe[title="PDF Preview"]') as HTMLIFrameElement;
    if (iframe?.contentWindow) {
      iframe.contentWindow.print();
      toast.success("Print dialog opened");
    } else {
      toast.error("Unable to print. Please download and print manually.");
    }
    setIsPrinting(false);
  };

  const handleDownloadAndClose = () => {
    onDownload();
    toast.success("PDF downloaded - you can now print it from your PDF viewer");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              {documentTitle} - Preview
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {formData && (
            <p className="text-sm text-muted-foreground mt-2">
              Click on any field in the PDF below to edit it directly. When done, use Print or Download.
            </p>
          )}
        </DialogHeader>

        <div className="flex-1 border rounded-lg overflow-hidden bg-muted/10 relative">
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title="PDF Preview"
            onLoad={() => console.log('✅ PDF iframe loaded')}
            onError={(e) => {
              console.error('❌ PDF iframe error:', e);
              toast.error('Failed to load PDF in preview. Try downloading instead.');
            }}
          />
          <div className="absolute bottom-4 right-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(pdfUrl, '_blank')}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Open in New Tab
            </Button>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            variant="secondary" 
            onClick={handlePrint} 
            disabled={isPrinting}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownloadAndClose} className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
