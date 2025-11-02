import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, Printer, Eye, Edit, Lock } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { detectDevice } from "@/utils/deviceDetection";

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
  const [pdfDataUrl, setPdfDataUrl] = useState<string>('');
  const device = detectDevice();

  // Convert blob URL to data URL for mobile compatibility
  // Only for small PDFs to avoid memory issues
  useEffect(() => {
    if (device.isMobile && pdfUrl && pdfUrl.startsWith('blob:')) {
      fetch(pdfUrl)
        .then(res => res.blob())
        .then(blob => {
          // Check size before converting to data URL
          const sizeMB = blob.size / (1024 * 1024);
          
          if (sizeMB > 2) {
            // PDF using blob URL for large file
            toast.info("Large PDF - using optimized mobile viewer", { duration: 3000 });
            setPdfDataUrl(pdfUrl); // Keep blob URL
            return;
          }
          
          const reader = new FileReader();
          reader.onloadend = () => {
            setPdfDataUrl(reader.result as string);
          };
          reader.readAsDataURL(blob);
        })
        .catch(err => {
          console.error('Failed to convert PDF for mobile:', err);
          toast.error('Failed to load PDF preview');
          // Fallback to blob URL
          setPdfDataUrl(pdfUrl);
        });
    }
  }, [pdfUrl, device.isMobile]);

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
    if (device.isIOS) {
      window.open(pdfUrl, '_blank');
      toast.info("PDF opened in new tab", { duration: 2000 });
    } else {
      window.open(pdfUrl, '_blank');
    }
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

      <div className="flex-1 border rounded-lg overflow-hidden bg-muted/10">
        <iframe 
          src={pdfUrl} 
          className="w-full h-full border-0"
          title="PDF Preview"
          onLoad={() => console.log('✅ PDF iframe loaded:', pdfUrl)}
          onError={(e) => {
            console.error('❌ PDF iframe error:', e);
            toast.error('Failed to load PDF preview');
          }}
        />
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
