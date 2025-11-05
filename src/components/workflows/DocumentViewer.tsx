import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight,
  Eye,
  EyeOff,
  Maximize2
} from "lucide-react";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface DocumentViewerProps {
  isOpen: boolean;
  onClose: () => void;
  documentUrl: string;
  documentName: string;
  documentType?: string;
  ocrText?: string;
}

export function DocumentViewer({
  isOpen,
  onClose,
  documentUrl,
  documentName,
  documentType,
  ocrText
}: DocumentViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [showOCR, setShowOCR] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(numPages || 1, prev + 1));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(2.5, prev + 0.25));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(0.5, prev - 0.25));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = documentName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isPDF = documentType?.toLowerCase() === 'pdf' || documentName.toLowerCase().endsWith('.pdf');
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].some(ext => 
    documentName.toLowerCase().endsWith(`.${ext}`)
  );
  const isText = ['txt', 'md', 'json', 'xml', 'csv', 'log'].some(ext =>
    documentName.toLowerCase().endsWith(`.${ext}`)
  );
  const isOffice = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].some(ext =>
    documentName.toLowerCase().endsWith(`.${ext}`)
  );

  const [textContent, setTextContent] = useState<string>('');
  const [isLoadingText, setIsLoadingText] = useState(false);

  // Load text content for text files
  const loadTextContent = async () => {
    if (!isText || !documentUrl) return;
    
    setIsLoadingText(true);
    try {
      const response = await fetch(documentUrl);
      const text = await response.text();
      setTextContent(text);
    } catch (error) {
      console.error('Failed to load text content:', error);
      setTextContent('Failed to load file content');
    } finally {
      setIsLoadingText(false);
    }
  };

  // Load text when document opens
  const handleDocumentOpen = () => {
    if (isText && isOpen) {
      loadTextContent();
    }
  };

  // Reset state when dialog closes
  const handleClose = () => {
    setTextContent('');
    setPageNumber(1);
    setScale(1.0);
    onClose();
  };

  // Handle text loading on open
  if (isOpen && isText && !textContent && !isLoadingText) {
    loadTextContent();
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Maximize2 className="h-5 w-5 text-primary" />
              {documentName}
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            {isPDF && numPages && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={pageNumber <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium px-3">
                  Page {pageNumber} of {numPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={pageNumber >= numPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={zoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium px-3 min-w-[60px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={zoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetZoom}>
              Reset
            </Button>

            {ocrText && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowOCR(!showOCR)}
              >
                {showOCR ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide OCR
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show OCR
                  </>
                )}
              </Button>
            )}

            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>

        {/* Document Content */}
        <div className="flex-1 overflow-auto p-6 bg-muted/20">
          <div className="flex justify-center">
            {isPDF ? (
              <Document
                file={documentUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                loading={
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                }
                error={
                  <div className="flex items-center justify-center h-96 text-destructive">
                    Failed to load PDF. Please try downloading the file.
                  </div>
                }
              >
                <Page
                  pageNumber={pageNumber}
                  scale={scale}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                />
              </Document>
            ) : isImage ? (
              <img
                src={documentUrl}
                alt={documentName}
                style={{ transform: `scale(${scale})`, transformOrigin: 'center top' }}
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            ) : isText ? (
              <div className="w-full max-w-4xl">
                {isLoadingText ? (
                  <div className="flex items-center justify-center h-96">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div 
                    className="bg-card border rounded-lg p-6 shadow-lg overflow-auto max-h-[600px]"
                    style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
                  >
                    <pre className="text-sm font-mono whitespace-pre-wrap break-words">
                      {textContent}
                    </pre>
                  </div>
                )}
              </div>
            ) : isOffice ? (
              <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                <div className="text-muted-foreground space-y-2">
                  <p className="text-lg font-semibold">Office Document Preview</p>
                  <p className="text-sm">
                    Preview for {documentName.split('.').pop()?.toUpperCase()} files requires downloading
                  </p>
                  <p className="text-xs">
                    You can use Microsoft Office, Google Docs, or LibreOffice to view this file
                  </p>
                </div>
                <Button onClick={handleDownload} size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Download to View
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
                <div className="text-muted-foreground space-y-2">
                  <p className="text-lg font-semibold">Preview Not Available</p>
                  <p className="text-sm">
                    This file type ({documentName.split('.').pop()?.toUpperCase()}) cannot be previewed in the browser
                  </p>
                </div>
                <Button onClick={handleDownload} size="lg">
                  <Download className="h-4 w-4 mr-2" />
                  Download to View
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* OCR Overlay */}
        {showOCR && ocrText && (
          <div className="border-t bg-muted/90 p-4 max-h-48 overflow-auto">
            <h4 className="font-semibold mb-2 text-sm">Extracted Text (OCR):</h4>
            <pre className="text-xs whitespace-pre-wrap font-mono">{ocrText}</pre>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
