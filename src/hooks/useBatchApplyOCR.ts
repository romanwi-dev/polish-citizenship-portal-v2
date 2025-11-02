import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BatchApplyResult {
  applied: number;
  conflicts: number;
  failed: number;
  errors: string[];
}

export const useBatchApplyOCR = (caseId: string) => {
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const queryClient = useQueryClient();

  const batchApplyMutation = useMutation({
    mutationFn: async (): Promise<BatchApplyResult> => {
      // Fetch all completed OCR documents that haven't been applied
      const { data: documents, error: fetchError } = await supabase
        .from("documents")
        .select("id, name, case_id")
        .eq("case_id", caseId)
        .eq("ocr_status", "completed")
        .eq("data_applied_to_forms", false);

      if (fetchError) throw fetchError;
      if (!documents || documents.length === 0) {
        throw new Error("No completed OCR documents found to apply");
      }

      // Batch OCR starting
      setProgress({ current: 0, total: documents.length });

      let applied = 0;
      let conflicts = 0;
      let failed = 0;
      const errors: string[] = [];

      // Process in batches of 5 to avoid overwhelming the server
      const BATCH_SIZE = 5;
      for (let i = 0; i < documents.length; i += BATCH_SIZE) {
        const batch = documents.slice(i, i + BATCH_SIZE);
        
        await Promise.all(
          batch.map(async (doc) => {
            try {
              const { data, error } = await supabase.functions.invoke(
                "apply-ocr-to-forms",
                {
                  body: {
                    documentId: doc.id,
                    caseId: doc.case_id,
                    overwriteManual: false,
                  },
                }
              );

              if (error) throw error;

              if (data?.success) {
                applied++;
                if (data.conflicts && data.conflicts.length > 0) {
                  conflicts += data.conflicts.length;
                }
              } else {
                failed++;
                errors.push(`${doc.name}: ${data?.error || "Unknown error"}`);
              }
            } catch (error) {
              failed++;
              const errorMsg = error instanceof Error ? error.message : "Unknown error";
              errors.push(`${doc.name}: ${errorMsg}`);
              console.error(`Failed to apply OCR for ${doc.name}:`, error);
            }
            
            setProgress(prev => ({ ...prev, current: prev.current + 1 }));
          })
        );

        // Small delay between batches
        if (i + BATCH_SIZE < documents.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      return { applied, conflicts, failed, errors };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["documents", caseId] });
      queryClient.invalidateQueries({ queryKey: ["ocr-conflicts", caseId] });
      queryClient.invalidateQueries({ queryKey: ["master-table", caseId] });

      const message = `Applied OCR data: ${result.applied} successful${
        result.conflicts > 0 ? `, ${result.conflicts} conflicts detected` : ""
      }${result.failed > 0 ? `, ${result.failed} failed` : ""}`;

      if (result.failed > 0) {
        toast.error("Batch apply completed with errors", {
          description: message,
        });
      } else if (result.conflicts > 0) {
        toast.warning("Batch apply completed with conflicts", {
          description: message,
        });
      } else {
        toast.success(message);
      }

      setProgress({ current: 0, total: 0 });
    },
    onError: (error) => {
      console.error("Batch apply error:", error);
      toast.error("Failed to apply OCR data", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
      setProgress({ current: 0, total: 0 });
    },
  });

  return {
    batchApply: batchApplyMutation.mutate,
    isApplying: batchApplyMutation.isPending,
    progress,
  };
};
