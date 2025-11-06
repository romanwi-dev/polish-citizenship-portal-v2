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

      const { data, error } = await supabase.functions.invoke("generate-document-pdfs", {
        body: { caseId, draft },
      });

      if (error) throw error;

      if (!data?.success) {
        throw new Error(data?.error || "PDF generation failed");
      }

      setResults(data.results);
      setProgress(100);

      const { summary } = data;
      
      if (summary.successful === summary.total) {
        toast({
          title: "PDFs Generated Successfully",
          description: `All ${summary.total} PDFs are ready for preview`,
        });
      } else if (summary.successful > 0) {
        toast({
          title: "Partial Success",
          description: `${summary.successful}/${summary.total} PDFs generated. ${summary.failed} failed.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Generation Failed",
          description: "No PDFs were generated successfully",
          variant: "destructive",
        });
      }

      return data;
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
