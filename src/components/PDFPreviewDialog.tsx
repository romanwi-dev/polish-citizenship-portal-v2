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

  const handlePrint = () => {
    setIsPrinting(true);
    
    // Handle base64 data URLs
    if (pdfUrl.startsWith('data:application/pdf')) {
      try {
        const byteString = atob(pdfUrl.split(',')[1]);
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        const printWindow = window.open(url, '_blank');
        if (printWindow) {
          printWindow.onload = () => {
            printWindow.print();
            URL.revokeObjectURL(url);
          };
          toast.success("Print dialog opened");
        } else {
          toast.error("Unable to open print window. Please check popup blocker.");
        }
      } catch (error) {
        console.error('Print error:', error);
        toast.error("Unable to print. Please download and print manually.");
      }
    } else {
      // Handle blob URLs via iframe
      const iframe = document.querySelector('iframe[title="PDF Preview"]') as HTMLIFrameElement;
      if (iframe?.contentWindow) {
        iframe.contentWindow.print();
        toast.success("Print dialog opened");
      } else {
        toast.error("Unable to print. Please download and print manually.");
      }
    }
    
    setIsPrinting(false);
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
          <p className="text-sm text-muted-foreground mt-2">
            This PDF preview shows filled form fields. You can:
            <br />
            • <strong>Print</strong> directly from here
            <br />
            • <strong>Download Editable</strong> as editable PDF to fill/sign offline in Adobe Acrobat
            <br />
            • <strong>Download Final</strong> as locked PDF for submission (fields cannot be changed)
            <br />
            • <strong>Edit data</strong> → Close preview, update forms, regenerate
          </p>
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
