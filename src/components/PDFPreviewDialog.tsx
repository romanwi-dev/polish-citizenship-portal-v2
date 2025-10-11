import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, X, Edit, FileText, Printer, ZoomIn, ZoomOut } from "lucide-react";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFPreviewDialogProps {
  open: boolean;
  onClose: () => void;
  pdfUrl: string;
  formData: any;
  onRegeneratePDF: (updatedData: any) => Promise<void>;
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
  const [editedData, setEditedData] = useState(formData || {});
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);

  // Update editedData when formData changes
  useEffect(() => {
    if (formData) {
      setEditedData(formData);
    }
  }, [formData]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditedData((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleRegenerate = async () => {
    try {
      setIsRegenerating(true);
      toast.loading("Regenerating PDF with your changes...");
      await onRegeneratePDF(editedData);
      toast.dismiss();
      toast.success("PDF updated successfully!");
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Failed to regenerate: ${error.message}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleDownloadAndClose = () => {
    onDownload();
    onClose();
  };

  const handlePrint = () => {
    const iframe = document.querySelector('iframe[title="PDF Preview"]') as HTMLIFrameElement;
    if (iframe) {
      iframe.contentWindow?.print();
      toast.success("Print dialog opened");
    } else {
      toast.error("Unable to print. Please download and print manually.");
    }
  };

  const renderEditableFields = () => {
    if (!formData || !editedData) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          No data available to edit
        </div>
      );
    }

    return (
      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-4">
          {Object.entries(formData).map(([key, value]) => {
            // Skip null, undefined, or complex objects
            if (value === null || value === undefined || typeof value === 'object') return null;
            
            return (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="text-sm font-medium capitalize">
                  {key.replace(/_/g, ' ')}
                </Label>
                <Input
                  id={key}
                  value={editedData?.[key] || ''}
                  onChange={(e) => handleFieldChange(key, e.target.value)}
                  className="w-full"
                />
              </div>
            );
          })}
        </div>
      </ScrollArea>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              {documentTitle} - Preview & Edit
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="preview" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">PDF Preview</TabsTrigger>
            <TabsTrigger value="edit">Edit Data</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2 px-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScale(s => Math.min(2, s + 0.1))}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Page {pageNumber} of {numPages}
              </div>
            </div>
            <ScrollArea className="flex-1 border rounded-lg bg-muted/20">
              <div className="flex justify-center p-4">
                <Document
                  file={pdfUrl}
                  onLoadSuccess={onDocumentLoadSuccess}
                  loading={
                    <div className="flex items-center justify-center p-8">
                      <div className="text-muted-foreground">Loading PDF template...</div>
                    </div>
                  }
                  error={
                    <div className="flex items-center justify-center p-8">
                      <div className="text-destructive">Failed to load PDF. Please try downloading it.</div>
                    </div>
                  }
                >
                  {Array.from(new Array(numPages), (_, index) => (
                    <Page
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      scale={scale}
                      className="mb-4 shadow-lg"
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                    />
                  ))}
                </Document>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="edit" className="flex-1">
            <div className="border rounded-lg p-6 bg-card">
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Edit Form Data</h3>
                <p className="text-sm text-muted-foreground">
                  Make changes to the data below and click "Regenerate PDF" to update the preview.
                </p>
              </div>
              {renderEditableFields()}
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  {isRegenerating ? "Regenerating..." : "Regenerate PDF"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="secondary" onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button onClick={handleDownloadAndClose} className="gap-2">
            <Download className="h-4 w-4" />
            Download & Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
