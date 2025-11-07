import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

interface PDFResult {
  templateId: string;
  name: string;
  status: "ready" | "error" | "pending";
  url?: string;
  path?: string;
  error?: string;
  fieldsPopulated?: number;
  totalFields?: number;
}

interface PDFGenerationResponse {
  success: boolean;
  results: PDFResult[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export function usePDFGeneration(caseId: string) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<PDFResult[]>([]);
  const [progress, setProgress] = useState(0);

  const generatePDFs = async (draft = true): Promise<PDFGenerationResponse | null> => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      toast({
        title: "Generating PDFs",
        description: "This may take a minute...",
      });

      // Use async queue system for each PDF template
      const { generatePdf } = await import('@/lib/generate-pdf');
      const templates = ['poa-adult', 'poa-minor', 'poa-spouses', 'citizenship', 'family-tree'];
      const generatedResults: PDFResult[] = [];
      
      for (const templateType of templates) {
        try {
          await generatePdf({
            supabase,
            caseId,
            templateType,
            toast: {
              loading: (msg: string) => {},
              dismiss: () => {},
              success: (msg: string) => {},
              error: (msg: string) => {},
            },
            setIsGenerating: () => {},
            filename: `${templateType}-${caseId}.pdf`
          });
          
          generatedResults.push({
            templateId: templateType,
            name: templateType.toUpperCase(),
            status: 'ready',
            url: '', // URL will be available in pdf_queue table
          });
        } catch (error: any) {
          generatedResults.push({
            templateId: templateType,
            name: templateType.toUpperCase(),
            status: 'error',
            error: error.message
          });
        }
        
        setProgress(Math.round((generatedResults.length / templates.length) * 100));
      }

      setResults(generatedResults);
      setProgress(100);

      const successful = generatedResults.filter(r => r.status === 'ready').length;
      const failed = generatedResults.filter(r => r.status === 'error').length;
      
      if (successful === templates.length) {
        toast({
          title: "PDFs Generated Successfully",
          description: `All ${templates.length} PDFs are ready`,
        });
      } else if (successful > 0) {
        toast({
          title: "Partial Success",
          description: `${successful}/${templates.length} PDFs generated. ${failed} failed.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: "No PDFs were generated successfully",
          variant: "destructive",
        });
      }

      return {
        success: successful > 0,
        results: generatedResults,
        summary: { total: templates.length, successful, failed }
      };
    } catch (error: any) {
      console.error("PDF generation error:", error);
      toast({
        title: "Generation Error",
        description: error.message || "Failed to generate PDFs",
        variant: "destructive",
      });
      setProgress(0);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast({
        title: "Download Started",
        description: `${filename} is downloading`,
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const approvePDFs = async () => {
    try {
      const { data: workflowData } = await supabase
        .from("workflow_instances")
        .select("id")
        .eq("case_id", caseId)
        .eq("workflow_type", "ai_documents")
        .single();

      if (!workflowData?.id) {
        throw new Error("Workflow instance not found");
      }

      const { error } = await supabase
        .from("workflow_instances")
        .update({
          approved_for_generation_at: new Date().toISOString(),
          approved_by_user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", workflowData.id);

      if (error) throw error;

      // Log approval
      await supabase.from("hac_logs").insert({
        case_id: caseId,
        performed_by: (await supabase.auth.getUser()).data.user?.id || '',
        action_type: "pdf_approval",
        action_details: "PDFs approved for final generation - " + new Date().toISOString(),
      });

      toast({
        title: "PDFs Approved",
        description: "PDFs are ready for final generation",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Approval Failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    generatePDFs,
    downloadPDF,
    approvePDFs,
    isGenerating,
    results,
    progress,
  };
}
