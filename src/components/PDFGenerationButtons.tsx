import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
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

interface PDFGenerationButtonsProps {
  caseId: string;
}

export function PDFGenerationButtons({ caseId }: PDFGenerationButtonsProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePDF = async (templateType: string, label: string) => {
    try {
      setIsGenerating(true);
      toast.loading(`Generating ${label}...`);

      const { data, error } = await supabase.functions.invoke('fill-pdf', {
        body: { caseId, templateType },
      });

      if (error) throw error;

      // Create a blob from the response
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${templateType}-${caseId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.dismiss();
      toast.success(`${label} generated successfully!`);
    } catch (error: any) {
      toast.dismiss();
      toast.error(`Failed to generate ${label}: ${error.message}`);
      console.error('PDF generation error:', error);
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
          className="text-sm md:text-base lg:text-xl font-bold px-4 md:px-6 h-10 md:h-12 lg:h-14 rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow backdrop-blur-md border border-white/30 min-w-[140px] md:min-w-[180px] lg:min-w-[200px] whitespace-nowrap"
        >
          <Download className="h-3 md:h-4 lg:h-5 w-3 md:w-4 lg:w-5 mr-1 md:mr-2 opacity-50" />
          <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Generate PDFs
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem onClick={() => handleGeneratePDF('family-tree', 'Family Tree')}>
          Family Tree
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleGeneratePDF('poa-adult', 'POA - Adult')}>
          POA - Adult
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleGeneratePDF('poa-minor', 'POA - Minor')}>
          POA - Minor
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleGeneratePDF('poa-spouses', 'POA - Spouses')}>
          POA - Spouses
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleGeneratePDF('registration', 'Civil Registry Application')}>
          Civil Registry Application
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleGeneratePDF('uzupelnienie', 'Birth Certificate Supplementation')}>
          Birth Certificate Supplementation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
