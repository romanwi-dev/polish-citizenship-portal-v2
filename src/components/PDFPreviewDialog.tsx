import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, Printer, Eye, Edit, Lock, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { openPdfUrl } from "@/lib/selftest-utils";
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
  documentId?: string;
  caseId?: string;
  onLockForPrint?: (lockedUrl: string) => void;
  showNavigation?: boolean;
  onNext?: () => void;
  onPrev?: () => void;
}

export function PDFPreviewDialog({
  open,
  onClose,
  pdfUrl,
  onDownloadEditable,
  onDownloadFinal,
  documentTitle,
  documentId,
  caseId,
  onLockForPrint,
  showNavigation = false,
  onNext,
  onPrev
}: PDFPreviewDialogProps) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
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
        const response = await fetch(pdfUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF: ${response.status}`);
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (error) {
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
    
    if (isMobile) {
      // On mobile, open PDF in new tab for easier printing
      window.open(urlToUse, '_blank');
      toast.success("PDF opened in new tab. Use browser menu to print.");
      setIsPrinting(false);
    } else {
      // Desktop: open in new window and trigger print dialog
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
    }
  };

  const handleOpenNewTab = () => {
    const urlToUse = blobUrl || pdfUrl;
    window.open(urlToUse, '_blank');
    toast.info("PDF opened in new tab", { duration: 2000 });
  };

  const handleDownload = async () => {
    try {
      const urlToUse = blobUrl || pdfUrl;
      const response = await fetch(urlToUse);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${documentTitle}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Download started");
    } catch (error) {
      toast.error("Failed to download PDF");
    }
  };

  const handleLockForPrint = async () => {
    if (!documentId || !caseId || !onLockForPrint) {
      toast.error("Cannot lock PDF - missing required information");
      return;
    }

    setIsLocking(true);
    const loadingToast = toast.loading("Preparing print-ready PDF...");

    try {
      const { supabase } = await import("@/integrations/supabase/client");
      
      const { data, error } = await supabase.functions.invoke('lock-pdf', {
        body: {
          documentId,
          caseId,
          pdfUrl
        }
      });

      toast.dismiss(loadingToast);

      if (error) {
        console.error('Lock PDF error:', error);
        toast.error(`Failed to prepare PDF: ${error.message}`);
        return;
      }

      if (!data?.success) {
        toast.error(data?.error || 'Failed to lock PDF');
        return;
      }

      toast.success(`Print-ready PDF prepared (${data.fieldsFlattened} fields locked)`);
      onLockForPrint(data.lockedUrl);
      
      // Update blob URL with locked PDF
      const response = await fetch(data.lockedUrl);
      const blob = await response.blob();
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
      const newBlobUrl = URL.createObjectURL(blob);
      setBlobUrl(newBlobUrl);

    } catch (error: any) {
      console.error('Lock PDF exception:', error);
      toast.dismiss(loadingToast);
      toast.error(`Failed to prepare PDF: ${error.message}`);
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[98vw] md:max-w-7xl h-[95vh] flex flex-col p-3 md:p-6">
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

        {/* PDF Preview with Navigation */}
        <div className="relative flex-1 border rounded-lg overflow-hidden bg-muted/10">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : blobUrl ? (
            <>
              <iframe 
                src={blobUrl} 
                className="w-full h-full border-0"
                title="PDF Preview"
              />
              
              {/* Navigation Arrows */}
              {showNavigation && (
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 pointer-events-none">
                  <Button
                    onClick={onPrev}
                    disabled={!onPrev}
                    size="icon"
                    variant="secondary"
                    className="pointer-events-auto h-12 w-12 rounded-full shadow-lg bg-background/90 hover:bg-background disabled:opacity-30"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button
                    onClick={onNext}
                    disabled={!onNext}
                    size="icon"
                    variant="secondary"
                    className="pointer-events-auto h-12 w-12 rounded-full shadow-lg bg-background/90 hover:bg-background disabled:opacity-30"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
              )}
            </>
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
                variant="secondary" 
                onClick={handlePrint} 
                disabled={isPrinting}
                className="gap-2 w-full"
              >
                <Printer className="h-4 w-4" />
                Print PDF
              </Button>
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
            <div className="flex justify-center gap-3 w-full">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="min-w-[140px] border-red-500 hover:border-red-600"
              >
                Close
              </Button>
              
              <Button
                variant="secondary"
                className="min-w-[140px]"
                disabled
                title="Coming soon - PDF optimization features"
              >
                Optimize
              </Button>
              
              <Button
                variant="secondary"
                onClick={handleOpenNewTab}
                className="min-w-[140px]"
              >
                Edit
              </Button>
              
              <Button
                onClick={handleDownload}
                className="min-w-[140px]"
              >
                Download
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={handlePrint} 
                disabled={isPrinting}
                className="min-w-[140px] border border-green-500 hover:border-green-600"
              >
                Print
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
