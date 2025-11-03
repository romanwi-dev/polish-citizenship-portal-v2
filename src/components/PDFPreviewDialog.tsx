import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, Printer, Eye, Edit, Lock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { detectDevice } from "@/utils/deviceDetection";
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  formData,
  onRegeneratePDF,
  onDownloadEditable,
  onDownloadFinal,
  documentTitle
}: PDFPreviewDialogProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const device = detectDevice();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
    console.log(`✅ PDF loaded: ${numPages} pages`);
  }

  const handlePrint = () => {
    setIsPrinting(true);
    
    try {
      if (device.isIOS) {
        // iOS: Open in new tab, user manually prints
        window.open(pdfUrl, '_blank');
        toast.info("PDF opened in new tab. Use browser menu to print", {
          duration: 4000
        });
      } else {
        // Desktop/Android: Trigger print dialog
        const printWindow = window.open(pdfUrl, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
          };
          toast.success("Print dialog opened");
        } else {
          toast.error("Unable to open print window. Please check popup blocker.");
        }
      }
    } catch (error) {
      console.error('Print error:', error);
      toast.error("Unable to print. Please download and print manually.");
    } finally {
      setIsPrinting(false);
    }
  };

  const handleOpenNewTab = () => {
    window.open(pdfUrl, '_blank');
    toast.info("PDF opened in new tab", { duration: 2000 });
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
        </DialogHeader>

        <div className="flex-1 border rounded-lg overflow-auto bg-muted/10">
          {device.isMobile || device.isIOS ? (
            // Mobile: Use react-pdf (renders as Canvas - works on iOS)
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              loading={
                <div className="flex items-center justify-center h-full">
                  <div className="text-muted-foreground">Loading PDF...</div>
                </div>
              }
              error={
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <div className="text-destructive">Failed to load PDF</div>
                  <Button onClick={handleOpenNewTab} variant="outline" size="sm">
                    Open in New Tab
                  </Button>
                </div>
              }
              className="flex flex-col items-center gap-4 p-4"
            >
              {Array.from(new Array(numPages), (el, index) => (
                <Page
                  key={`page_${index + 1}`}
                  pageNumber={index + 1}
                  width={Math.min(window.innerWidth - 40, 800)}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              ))}
            </Document>
          ) : (
            // Desktop: Use iframe (better performance)
            <iframe 
              src={pdfUrl} 
              className="w-full h-full border-0"
              title="PDF Preview"
              onLoad={() => console.log('✅ PDF iframe loaded')}
            />
          )}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
