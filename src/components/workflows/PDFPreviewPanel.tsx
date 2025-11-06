import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Eye, 
  Download, 
  CheckCircle2,
  Loader2,
  AlertCircle,
  Lock
} from "lucide-react";
import { usePDFGeneration } from "@/hooks/usePDFGeneration";
import { DocumentViewer } from "./DocumentViewer";
import { cn } from "@/lib/utils";

interface PDFTemplate {
  id: string;
  name: string;
  description: string;
  previewUrl?: string;
  status: 'pending' | 'generating' | 'ready' | 'error';
}

interface PDFPreviewPanelProps {
  caseId: string;
  onConfirmGeneration: () => Promise<void>;
  onRegenerateWithChanges: () => Promise<void>;
}

const PDF_TEMPLATES: PDFTemplate[] = [
  {
    id: 'poa_adult',
    name: 'POA - Adult',
    description: 'Power of Attorney for adult applicant',
    status: 'pending'
  },
  {
    id: 'poa_minor',
    name: 'POA - Minor',
    description: 'Power of Attorney for minor children',
    status: 'pending'
  },
  {
    id: 'poa_spouses',
    name: 'POA - Spouses',
    description: 'Power of Attorney for spouse',
    status: 'pending'
  },
  {
    id: 'citizenship',
    name: 'Citizenship Application',
    description: 'Main citizenship application form',
    status: 'pending'
  },
  {
    id: 'family_tree',
    name: 'Family Tree',
    description: 'Visual family genealogy diagram',
    status: 'pending'
  },
  {
    id: 'uzupelnienie',
    name: 'Uzupełnienie',
    description: 'Supplementary documentation form',
    status: 'pending'
  }
];

export function PDFPreviewPanel({ 
  caseId, 
  onConfirmGeneration,
  onRegenerateWithChanges 
}: PDFPreviewPanelProps) {
  const { generatePDFs, downloadPDF, approvePDFs, isGenerating, results, progress } = usePDFGeneration(caseId);
  const [selectedPDF, setSelectedPDF] = useState<{ url: string; name: string } | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleGeneratePreviews = async () => {
    await generatePDFs(true);
  };

  const handleViewPDF = (result: any) => {
    if (!result.url) return;
    setSelectedPDF({ url: result.url, name: result.name });
    setIsViewerOpen(true);
  };

  const handleDownloadPDF = async (result: any) => {
    if (!result.url) return;
    await downloadPDF(result.url, `${result.name}_draft.pdf`);
  };

  const handleApprove = async () => {
    const success = await approvePDFs();
    if (success) {
      await onConfirmGeneration();
    }
  };

  const handleRegenerate = async () => {
    await onRegenerateWithChanges();
  };

  const successCount = results.filter(r => r.status === 'ready').length;
  const totalCount = results.length || 6;
  const allReady = results.length > 0 && results.every(r => r.status === 'ready');
  const anyError = results.some(r => r.status === 'error');

  return (
    <>
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                PDF Preview & Generation
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Review all PDFs before final generation
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isGenerating && (
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{Math.round(progress)}%</span>
                </div>
              )}
              <Button
                onClick={handleGeneratePreviews}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Generate Previews
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar */}
          {isGenerating && (
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                Generating {successCount}/{totalCount} PDFs...
              </p>
            </div>
          )}

          {/* PDF Results Grid */}
          {results.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((result) => (
                <div
                  key={result.templateId}
                  className={cn(
                    "border rounded-lg p-4 transition-all",
                    result.status === 'ready' && "border-success/50 bg-success/5",
                    result.status === 'error' && "border-destructive/50 bg-destructive/5"
                  )}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-semibold">{result.name}</h4>
                      {result.fieldsPopulated !== undefined && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {result.fieldsPopulated}/{result.totalFields} fields filled
                        </p>
                      )}
                      {result.error && (
                        <p className="text-xs text-destructive mt-1">
                          {result.error}
                        </p>
                      )}
                    </div>
                    {result.status === 'ready' && (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    )}
                    {result.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPDF(result)}
                      disabled={result.status !== 'ready'}
                      className="flex-1"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadPDF(result)}
                      disabled={result.status !== 'ready'}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          {results.length > 0 && (
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleRegenerate}
                className="flex-1"
              >
                Regenerate with Changes
              </Button>
              <Button
                onClick={handleApprove}
                disabled={!allReady || anyError}
                className="flex-1"
              >
                <Lock className="h-4 w-4 mr-2" />
                Approve & Lock for Final
              </Button>
            </div>
          )}

          {anyError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-sm">
              <p className="text-destructive font-semibold mb-1">
                Some PDFs failed to generate
              </p>
              <p className="text-muted-foreground">
                Please check the error logs and try regenerating.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* PDF Viewer Modal */}
      {selectedPDF && (
        <DocumentViewer
          isOpen={isViewerOpen}
          onClose={() => setIsViewerOpen(false)}
          documentUrl={selectedPDF.url}
          documentName={selectedPDF.name}
          documentType="pdf"
        />
      )}
    </>
  );
}
