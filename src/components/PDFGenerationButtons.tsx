import { Button } from "@/components/ui/button";
import { Download, Eye, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PDFPreviewDialog } from "./PDFPreviewDialog";
import { validatePDFGeneration, formatFieldName, ValidationResult } from "@/utils/pdfValidation";

interface PDFGenerationButtonsProps {
  caseId: string;
}

export function PDFGenerationButtons({ caseId }: PDFGenerationButtonsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [currentTemplate, setCurrentTemplate] = useState({ type: "", label: "" });
  const [formData, setFormData] = useState<any>(null);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [pendingGeneration, setPendingGeneration] = useState<{ templateType: string; label: string; preview: boolean } | null>(null);

  const handleGeneratePDF = async (templateType: string, label: string, preview: boolean = false) => {
    try {
      setIsGenerating(true);
      const loadingToast = toast.loading(`Generating ${label}...`);

      // Fetch current form data
      const { data: masterData } = await supabase
        .from("master_table")
        .select("*")
        .eq("case_id", caseId)
        .maybeSingle();

      // Validate before generation
      if (masterData) {
        const validation = validatePDFGeneration(masterData, templateType);
        
        if (!validation.isValid && validation.coverage < 80) {
          // Show validation warning if coverage is low
          setValidationResult(validation);
          setPendingGeneration({ templateType, label, preview });
          setValidationDialogOpen(true);
          toast.dismiss(loadingToast);
          setIsGenerating(false);
          return;
        } else if (!validation.isValid) {
          // Show toast warning but continue
          toast.warning(`${validation.missingFields.length} fields missing (${validation.coverage}% complete)`, {
            duration: 3000,
          });
        }
      }

      console.log('Invoking fill-pdf function with:', { caseId, templateType });
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fill-pdf`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ caseId, templateType, preview }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Edge function error:', errorText);
        throw new Error(`Failed to generate PDF: ${errorText}`);
      }

      console.log('PDF data received, creating blob...');
      
      // Get the PDF as a blob
      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      console.log('Blob URL created:', url);

      toast.dismiss(loadingToast);

      if (preview) {
        // Open preview dialog
        setPreviewUrl(url);
        setCurrentTemplate({ type: templateType, label });
        setFormData(masterData);
        setPreviewOpen(true);
        toast.success(`${label} ready for preview!`);
      } else {
        // Direct download
        const link = document.createElement('a');
        link.href = url;
        link.download = `${templateType}-${caseId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success(`${label} downloaded successfully!`);
      }
    } catch (error: any) {
      console.error('PDF generation error:', error);
      toast.dismiss();
      toast.error(`Failed to generate ${label}: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegeneratePDF = async (updatedData: any) => {
    // Update master table first
    await supabase
      .from("master_table")
      .update(updatedData)
      .eq("case_id", caseId);

    // Regenerate PDF
    await handleGeneratePDF(currentTemplate.type, currentTemplate.label, true);
  };

  const handleDownloadFromPreview = async () => {
    // Generate an editable PDF for download
    await handleGeneratePDF(currentTemplate.type, currentTemplate.label, true);
    setPreviewOpen(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="default" 
          disabled={isGenerating}
          className="text-sm md:text-base lg:text-xl font-bold px-6 md:px-8 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[160px] md:min-w-[220px] lg:min-w-[260px] whitespace-nowrap"
        >
          <Download className="h-3 md:h-4 lg:h-5 w-3 md:w-4 lg:w-5 mr-1 md:mr-2 opacity-50" />
          <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Generate PDFs
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 bg-background/95 backdrop-blur-sm border-primary/20 z-50">
        <DropdownMenuItem onClick={() => handleGeneratePDF('family-tree', 'Family Tree', true)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview Family Tree
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleGeneratePDF('citizenship', 'Citizenship Application', true)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview Citizenship Application
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleGeneratePDF('poa-adult', 'POA - Adult', true)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview POA - Adult
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleGeneratePDF('poa-minor', 'POA - Minor', true)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview POA - Minor
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleGeneratePDF('poa-spouses', 'POA - Spouses', true)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview POA - Spouses
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleGeneratePDF('umiejscowienie', 'Civil Registry Entry (Umiejscowienie)', true)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview Civil Registry Entry (Umiejscowienie)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleGeneratePDF('uzupelnienie', 'Birth Certificate Supplementation', true)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview Birth Certificate Supplementation
        </DropdownMenuItem>
      </DropdownMenuContent>
      
      <PDFPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        pdfUrl={previewUrl}
        formData={formData}
        onRegeneratePDF={handleRegeneratePDF}
        onDownload={handleDownloadFromPreview}
        documentTitle={currentTemplate.label}
      />

      <AlertDialog open={validationDialogOpen} onOpenChange={setValidationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Missing Required Fields
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>
                The PDF is only <strong>{validationResult?.coverage}% complete</strong>. 
                {validationResult && validationResult.missingFields.length > 0 && (
                  <span> Missing {validationResult.missingFields.length} required field(s):</span>
                )}
              </p>
              {validationResult && validationResult.missingFields.length > 0 && (
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {validationResult.missingFields.slice(0, 10).map(field => (
                    <li key={field}>{formatFieldName(field)}</li>
                  ))}
                  {validationResult.missingFields.length > 10 && (
                    <li className="text-muted-foreground">
                      ...and {validationResult.missingFields.length - 10} more
                    </li>
                  )}
                </ul>
              )}
              <p className="text-sm text-muted-foreground">
                Continue anyway or go back to fill in the missing information?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingGeneration(null)}>
              Go Back & Fill Data
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingGeneration) {
                  setValidationDialogOpen(false);
                  handleGeneratePDF(pendingGeneration.templateType, pendingGeneration.label, pendingGeneration.preview);
                  setPendingGeneration(null);
                }
              }}
            >
              Continue Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DropdownMenu>
  );
}
