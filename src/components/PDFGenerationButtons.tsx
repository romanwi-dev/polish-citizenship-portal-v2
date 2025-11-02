import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
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
import { PDFPreviewDialog } from "./PDFPreviewDialog";
import { validatePDFGeneration } from "@/utils/pdfValidation";
import { detectDevice } from "@/utils/deviceDetection";

interface PDFGenerationButtonsProps {
  caseId: string;
}

export function PDFGenerationButtons({ caseId }: PDFGenerationButtonsProps) {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [currentTemplate, setCurrentTemplate] = useState({ type: "", label: "" });
  const [formData, setFormData] = useState<any>(null);

  const cleanupPreviewUrl = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      window.URL.revokeObjectURL(previewUrl);
    }
  };

  const handleGeneratePDF = async (templateType: string, label: string, flatten: boolean = false) => {
    try {
      setIsGenerating(true);
      const loadingToast = toast.loading(`Generating ${label}...`);

      // Fetch current form data
      const { data: masterData } = await supabase
        .from("master_table")
        .select("*")
        .eq("case_id", caseId)
        .maybeSingle();

      // Show informational toast if not 100% complete (never block generation)
      if (masterData) {
        const validation = validatePDFGeneration(masterData, templateType);
        
        if (validation.coverage < 100) {
          toast.info(
            `PDF generated (${validation.coverage}% complete). Remaining fields can be filled manually.`,
            { duration: 4000 }
          );
        }
      }

      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { caseId, templateType, flatten }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(`Failed to generate PDF: ${error.message}`);
      }
      
      // Get the PDF as a blob
      const blob = new Blob([data], { type: 'application/pdf' });

      toast.dismiss(loadingToast);

      if (!flatten) {
        // For preview and editable download - show in dialog
        // Use Object URL (blob://) instead of base64 for better performance
        const url = window.URL.createObjectURL(blob);
        setPreviewUrl(url);
        setCurrentTemplate({ type: templateType, label });
        setFormData(masterData);
        setPreviewOpen(true);
        toast.success(`${label} ready!`);
      } else {
        // For final locked download - direct download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${templateType}-${caseId}-final.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success(`${label} (final locked) downloaded!`);
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

    // Regenerate PDF (editable)
    await handleGeneratePDF(currentTemplate.type, currentTemplate.label, false);
  };

  const handlePlatformDownload = (blob: Blob, filename: string, isEditable: boolean) => {
    const device = detectDevice();
    
    if (device.isIOS) {
      // iOS: window.open in new tab with user guidance
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      toast.info("PDF opened in new tab. Tap the Share icon → Save to Files to download", {
        duration: 5000
      });
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } else {
      // Desktop + Android: standard download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      if (isEditable) {
        toast.success("Editable PDF downloaded - fill in Adobe Acrobat");
      } else {
        toast.success("Final PDF downloaded (locked fields)");
      }
    }
  };

  const handleDownloadEditable = async () => {
    try {
      setIsGenerating(true);
      const loadingToast = toast.loading(`Generating editable ${currentTemplate.label}...`);

      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { caseId, templateType: currentTemplate.type, flatten: false }
      });

      if (error) throw new Error(`Failed to generate PDF: ${error.message}`);

      const blob = new Blob([data], { type: 'application/pdf' });
      toast.dismiss(loadingToast);
      
      handlePlatformDownload(blob, `${currentTemplate.type}-${caseId}-editable.pdf`, true);
      setPreviewOpen(false);
      cleanupPreviewUrl();
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(`Failed to download: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadFinal = async () => {
    try {
      setIsGenerating(true);
      const loadingToast = toast.loading(`Generating final ${currentTemplate.label}...`);

      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { caseId, templateType: currentTemplate.type, flatten: true }
      });

      if (error) throw new Error(`Failed to generate PDF: ${error.message}`);

      const blob = new Blob([data], { type: 'application/pdf' });
      toast.dismiss(loadingToast);
      
      handlePlatformDownload(blob, `${currentTemplate.type}-${caseId}-final.pdf`, false);
      setPreviewOpen(false);
      cleanupPreviewUrl();
    } catch (error: any) {
      console.error('Download error:', error);
      toast.error(`Failed to download: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="default" 
          disabled={isGenerating}
          className="text-lg md:text-xl lg:text-2xl font-bold px-8 md:px-12 lg:px-16 h-14 md:h-16 lg:h-20 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[200px] md:min-w-[280px] lg:min-w-[360px] whitespace-nowrap mb-8"
        >
          <Download className="h-5 md:h-6 lg:h-7 w-5 md:w-6 lg:w-7 mr-2 md:mr-3 opacity-50" />
          <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Generate PDFs
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 bg-background/95 backdrop-blur-sm border-primary/20 z-50">
        <DropdownMenuItem onClick={() => handleGeneratePDF('family-tree', 'Family Tree', false)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview Family Tree
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleGeneratePDF('citizenship', 'Citizenship Application', false)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview Citizenship Application
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleGeneratePDF('poa-adult', 'POA - Adult', false)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview POA - Adult
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleGeneratePDF('poa-minor', 'POA - Minor', false)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview POA - Minor
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleGeneratePDF('poa-spouses', 'POA - Spouses', false)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview POA - Spouses
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleGeneratePDF('umiejscowienie', 'Civil Registry Entry (Umiejscowienie)', false)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview Civil Registry Entry (Umiejscowienie)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleGeneratePDF('uzupelnienie', 'Birth Certificate Supplementation', false)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview Birth Certificate Supplementation
        </DropdownMenuItem>
      </DropdownMenuContent>
      
      <PDFPreviewDialog
        open={previewOpen}
        onClose={() => {
          setPreviewOpen(false);
          cleanupPreviewUrl();
        }}
        pdfUrl={previewUrl}
        formData={formData}
        onRegeneratePDF={handleRegeneratePDF}
        onDownloadEditable={handleDownloadEditable}
        onDownloadFinal={handleDownloadFinal}
        documentTitle={currentTemplate.label}
      />

    </DropdownMenu>
  );
}
