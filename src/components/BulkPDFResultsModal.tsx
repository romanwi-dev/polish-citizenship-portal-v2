import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Download, Eye, X } from 'lucide-react';
import { PDFPreviewDialog } from '@/components/PDFPreviewDialog';
import { toast } from 'sonner';

interface PDFResult {
  templateType: string;
  success: boolean;
  url?: string;
  error?: string;
  fieldsFilledCount?: number;
  totalFields?: number;
  fillRate?: number;
}

interface BulkPDFResultsModalProps {
  open: boolean;
  onClose: () => void;
  results: PDFResult[];
  onDownload: (url: string, templateType: string) => void;
}

const TEMPLATE_NAMES: Record<string, string> = {
  'poa-adult': 'POA Adult',
  'poa-minor': 'POA Minor',
  'poa-spouses': 'POA Spouses',
  'family-tree': 'Family Tree',
  'citizenship': 'Citizenship Application',
  'registration': 'Civil Registry',
  'transcription': 'Transcription',
};

export function BulkPDFResultsModal({ 
  open, 
  onClose, 
  results, 
  onDownload 
}: BulkPDFResultsModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0);
  
  const successCount = results.filter(r => r.success).length;
  const successfulResults = results.filter(r => r.success && r.url);

  const handlePreview = (url: string, templateType: string) => {
    setPreviewUrl(url);
    setPreviewTitle(TEMPLATE_NAMES[templateType] || templateType);
  };

  const handlePreviewAll = () => {
    if (successfulResults.length === 0) {
      toast.error('No successful PDFs to preview');
      return;
    }
    setCurrentPreviewIndex(0);
    handlePreview(successfulResults[0].url!, successfulResults[0].templateType);
  };

  const handleNextPreview = () => {
    if (currentPreviewIndex < successfulResults.length - 1) {
      const nextIndex = currentPreviewIndex + 1;
      setCurrentPreviewIndex(nextIndex);
      handlePreview(successfulResults[nextIndex].url!, successfulResults[nextIndex].templateType);
    }
  };

  const handlePrevPreview = () => {
    if (currentPreviewIndex > 0) {
      const prevIndex = currentPreviewIndex - 1;
      setCurrentPreviewIndex(prevIndex);
      handlePreview(successfulResults[prevIndex].url!, successfulResults[prevIndex].templateType);
    }
  };

  const handleDownloadAll = async () => {
    if (successfulResults.length === 0) {
      toast.error('No successful PDFs to download');
      return;
    }

    toast.loading(`Downloading ${successfulResults.length} PDFs...`);
    
    for (const result of successfulResults) {
      if (result.url) {
        try {
          const response = await fetch(result.url);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${TEMPLATE_NAMES[result.templateType] || result.templateType}.pdf`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          // Small delay between downloads
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Failed to download ${result.templateType}:`, error);
        }
      }
    }
    
    toast.dismiss();
    toast.success(`Downloaded ${successfulResults.length} PDFs`);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        {/* Results List */}
        <div className="space-y-3 mt-6">
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${
                result.success
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-red-500/10 border-red-500/30'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {result.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base">
                      {TEMPLATE_NAMES[result.templateType] || result.templateType}
                    </h3>
                    
                    {result.success ? (
                      <div className="text-sm text-muted-foreground mt-1">
                        {result.fieldsFilledCount && result.totalFields && (
                          <span>
                            {result.fieldsFilledCount}/{result.totalFields} fields filled
                            {result.fillRate && ` (${Math.round(result.fillRate * 100)}%)`}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-red-300 mt-1">
                        {result.error || 'Generation failed'}
                      </div>
                    )}
                  </div>
                </div>

                {result.success && result.url && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      onClick={() => handlePreview(result.url!, result.templateType)}
                      size="sm"
                      variant="outline"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      onClick={() => onDownload(result.url!, result.templateType)}
                      size="sm"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Action Buttons */}
        <div className="flex justify-center gap-4 pt-6 border-t">
          <Button onClick={onClose} variant="outline" size="lg">
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
          <Button 
            onClick={handlePreviewAll} 
            variant="outline" 
            size="lg"
            disabled={successfulResults.length === 0}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview All
          </Button>
          <Button 
            onClick={handleDownloadAll}
            size="lg"
            disabled={successfulResults.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Download All
          </Button>
        </div>

        {/* PDF Preview Dialog */}
        <PDFPreviewDialog
          open={!!previewUrl}
          onClose={() => setPreviewUrl(null)}
          pdfUrl={previewUrl || ""}
          formData={{}}
          onRegeneratePDF={async () => {}}
          onDownloadEditable={() => previewUrl && window.open(previewUrl, '_blank')}
          onDownloadFinal={() => previewUrl && window.open(previewUrl, '_blank')}
          documentTitle={`${previewTitle} (${currentPreviewIndex + 1}/${successfulResults.length})`}
        />
      </DialogContent>
    </Dialog>
  );
}
