import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Eye, 
  Download, 
  CheckCircle2,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  const { toast } = useToast();
  const [templates, setTemplates] = useState<PDFTemplate[]>(PDF_TEMPLATES);
  const [isGeneratingPreviews, setIsGeneratingPreviews] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<PDFTemplate | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const generatePreviews = async () => {
    setIsGeneratingPreviews(true);
    
    try {
      // Update all to generating status
      setTemplates(prev => prev.map(t => ({ ...t, status: 'generating' as const })));

      // Call edge function to generate draft PDFs
      const { data, error } = await supabase.functions.invoke('generate-pdf-previews', {
        body: { caseId }
      });

      if (error) throw error;

      // Update templates with preview URLs
      setTemplates(prev => prev.map(template => {
        const preview = data?.previews?.find((p: any) => p.templateId === template.id);
        return {
          ...template,
          status: preview ? 'ready' as const : 'error' as const,
          previewUrl: preview?.url
        };
      }));

      toast({
        title: "Previews Generated",
        description: "PDF previews are ready for review."
      });
    } catch (error: any) {
      console.error('Preview generation failed:', error);
      
      setTemplates(prev => prev.map(t => ({ ...t, status: 'error' as const })));
      
      toast({
        title: "Preview Generation Failed",
        description: error.message || "Could not generate PDF previews.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPreviews(false);
    }
  };

  const viewPDF = (template: PDFTemplate) => {
    if (!template.previewUrl) return;
    
    setSelectedPDF(template);
    setIsViewerOpen(true);
  };

  const downloadPDF = async (template: PDFTemplate) => {
    if (!template.previewUrl) return;

    try {
      const response = await fetch(template.previewUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${template.name}_preview.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the preview PDF.",
        variant: "destructive"
      });
    }
  };

  const handleConfirm = async () => {
    try {
      await onConfirmGeneration();
      toast({
        title: "PDFs Generated",
        description: "Final PDFs have been generated successfully."
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRegenerateWithChanges = async () => {
    try {
      await onRegenerateWithChanges();
      // Reset templates to pending
      setTemplates(PDF_TEMPLATES);
      toast({
        title: "Regenerating",
        description: "Apply your changes, then generate previews again."
      });
    } catch (error: any) {
      toast({
        title: "Regeneration Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const allReady = templates.every(t => t.status === 'ready');
  const anyError = templates.some(t => t.status === 'error');

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
            <Button
              onClick={generatePreviews}
              disabled={isGeneratingPreviews}
            >
              {isGeneratingPreviews ? (
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
        </CardHeader>

        <CardContent className="space-y-4">
          {/* PDF Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div
                key={template.id}
                className={cn(
                  "border rounded-lg p-4 transition-all",
                  template.status === 'ready' && "border-success/50 bg-success/5",
                  template.status === 'error' && "border-destructive/50 bg-destructive/5"
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{template.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {template.description}
                    </p>
                  </div>
                  {template.status === 'ready' && (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  )}
                  {template.status === 'error' && (
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  )}
                  {template.status === 'generating' && (
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => viewPDF(template)}
                    disabled={template.status !== 'ready'}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadPDF(template)}
                    disabled={template.status !== 'ready'}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          {templates.some(t => t.status !== 'pending') && (
            <div className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleRegenerateWithChanges}
                className="flex-1"
              >
                Regenerate with Changes
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!allReady || anyError}
                className="flex-1"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm & Generate Final PDFs
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
          documentUrl={selectedPDF.previewUrl || ''}
          documentName={`${selectedPDF.name}_preview.pdf`}
          documentType="pdf"
        />
      )}
    </>
  );
}
