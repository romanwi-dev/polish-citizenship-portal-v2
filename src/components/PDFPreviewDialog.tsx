import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, Printer, Eye, Edit, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PDFPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  formData?: any;
  onRegeneratePDF?: (updatedData: any) => Promise<void>;
  onDownloadEditable: () => void;
  onDownloadFinal: () => void;
  documentTitle: string;
}

export function PDFPreviewDialog({
  open,
  onClose,
  pdfUrl,
  onDownloadEditable,
  onDownloadFinal,
  documentTitle
}: PDFPreviewDialogProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const isMobile = useIsMobile();

  // Log PDF URL for debugging
  console.log('[PDFPreviewDialog] Rendering with:', { open, pdfUrl, documentTitle });

  const handlePrint = () => {
    setIsPrinting(true);
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
      toast.success("Print dialog opened");
    } else {
      toast.error("Unable to open print window. Please check popup blocker.");
    }
    setIsPrinting(false);
  };

  const handleOpenNewTab = () => {
    window.open(pdfUrl, '_blank');
    toast.info("PDF opened in new tab", { duration: 2000 });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[95vw] md:max-w-6xl h-[90vh] flex flex-col p-3 md:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {documentTitle} - Preview
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 border rounded-lg overflow-hidden bg-muted/10">
          {pdfUrl ? (
            <iframe 
              src={pdfUrl} 
              className="w-full h-full border-0"
              title="PDF Preview"
              onError={() => {
                console.error('[PDFPreviewDialog] iframe failed to load PDF');
                toast.error('Failed to load PDF preview');
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No PDF URL provided</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col md:flex-row gap-2">
          {isMobile ? (
            <>
              <Button 
                variant="default" 
                onClick={onDownloadEditable}
                className="gap-2 w-full"
              >
                <Download className="h-4 w-4" />
                Download Editable
              </Button>
              <Button 
                variant="secondary" 
                onClick={onDownloadFinal}
                className="gap-2 w-full"
              >
                <Lock className="h-4 w-4" />
                Download Final
              </Button>
              <Button variant="outline" onClick={onClose} className="w-full">
                Close
              </Button>
            </>
          ) : (
            <>
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
              <Button
                variant="secondary"
                onClick={handleOpenNewTab}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Open in New Tab
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="gap-2">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onDownloadEditable}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editable (for offline editing)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onDownloadFinal}>
                    <Lock className="h-4 w-4 mr-2" />
                    Final (locked fields)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
