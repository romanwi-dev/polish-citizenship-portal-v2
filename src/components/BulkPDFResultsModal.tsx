import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Download, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PDFPreviewDialog } from '@/components/PDFPreviewDialog';

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
};

export function BulkPDFResultsModal({ 
  open, 
  onClose, 
  results, 
  onDownload 
}: BulkPDFResultsModalProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  
  const successCount = results.filter(r => r.success).length;
  const failedCount = results.filter(r => !r.success).length;

  const handlePreview = (url: string, templateType: string) => {
    setPreviewUrl(url);
    setPreviewTitle(TEMPLATE_NAMES[templateType] || templateType);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Generation Complete: {successCount}/{results.length} PDFs
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Success Summary */}
          <div className="flex gap-4">
            <Badge variant="outline" className="bg-green-500/20 border-green-500/40 text-green-100">
              {successCount} Successful
            </Badge>
            {failedCount > 0 && (
              <Badge variant="outline" className="bg-red-500/20 border-red-500/40 text-red-100">
                {failedCount} Failed
              </Badge>
            )}
          </div>

          {/* Results List */}
          <div className="space-y-3">
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

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
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
          documentTitle={previewTitle}
        />
      </DialogContent>
    </Dialog>
  );
}
