import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, Printer, Eye, Edit, Lock, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
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
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isMobile = useIsMobile();

  // Download PDF and create blob URL for preview
  useEffect(() => {
    if (!pdfUrl || !open) {
      setBlobUrl(null);
      return;
    }

    const loadPDF = async () => {
      setIsLoading(true);
      try {
        console.log('[PDFPreviewDialog] Fetching PDF from:', pdfUrl);
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status}`);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        console.log('[PDFPreviewDialog] Blob URL created successfully');
      } catch (error) {
        console.error('[PDFPreviewDialog] Failed to load PDF:', error);
        toast.error('Failed to load PDF preview');
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();

    // Cleanup blob URL when dialog closes
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [pdfUrl, open]);

  const handlePrint = () => {
    const urlToUse = blobUrl || pdfUrl;
    setIsPrinting(true);
    const printWindow = window.open(urlToUse, '_blank');
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
    const urlToUse = blobUrl || pdfUrl;
    window.open(urlToUse, '_blank');
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

        {isMobile && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-2">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
              📱 Editing PDFs on Mobile
            </p>
            <p className="text-xs text-muted-foreground">
              Mobile browsers can't edit PDF forms. Download the <strong>Editable PDF</strong> and open it in a PDF editor app like Adobe Acrobat Reader (free), Xodo, or PDF Expert to fill in the fields.
            </p>
          </div>
        )}

        <div className="flex-1 border rounded-lg overflow-hidden bg-muted/10">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : blobUrl ? (
            <iframe 
              src={blobUrl} 
              className="w-full h-full border-0"
              title="PDF Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Failed to load PDF preview</p>
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
                Download Editable PDF
              </Button>
              <Button 
                variant="secondary" 
                onClick={onDownloadFinal}
                className="gap-2 w-full"
              >
                <Lock className="h-4 w-4" />
                Download Final (Locked)
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
