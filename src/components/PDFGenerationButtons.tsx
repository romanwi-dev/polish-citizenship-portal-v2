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

interface PDFGenerationButtonsProps {
  caseId: string;
}

export function PDFGenerationButtons({ caseId }: PDFGenerationButtonsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [currentTemplate, setCurrentTemplate] = useState({ type: "", label: "" });
  const [formData, setFormData] = useState<any>(null);

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

      console.log('Invoking fill-pdf function with:', { caseId, templateType });
      
      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { caseId, templateType },
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No PDF data received from edge function');
      }

      console.log('PDF data received, creating blob...');
      
      // The edge function returns raw bytes, convert to Blob
      const blob = data instanceof Blob ? data : new Blob([data], { type: 'application/pdf' });

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

  const handleDownloadFromPreview = () => {
    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `${currentTemplate.type}-${caseId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
        <DropdownMenuItem onClick={() => handleGeneratePDF('registration', 'Civil Registry Application', true)}>
          <Eye className="h-4 w-4 mr-2" />
          Preview Civil Registry Application
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
    </DropdownMenu>
  );
}
