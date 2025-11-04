import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TranslationJob {
  id: string;
  case_id: string;
  document_id?: string;
  task_id?: string;
  source_text: string;
  source_language: string;
  target_language: string;
  document_type?: string;
  status: string;
  workflow_stage: string;
  stage_entered_at: string;
  ai_translation?: string;
  ai_confidence?: number;
  ai_translated_at?: string;
  human_translation?: string;
  human_reviewed_by?: string;
  human_reviewed_at?: string;
  human_review_notes?: string;
  quality_score?: number;
  assigned_translator_id?: string;
  final_translation?: string;
  final_document_id?: string;
  priority: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface TranslationHistory {
  id: string;
  job_id: string;
  change_type: string;
  old_value?: string;
  new_value?: string;
  changed_by?: string;
  notes?: string;
  created_at: string;
}

/**
 * Hook to manage translation workflow
 */
export function useTranslationWorkflow(jobId: string | undefined) {
  const queryClient = useQueryClient();

  const { data: job, isLoading } = useQuery({
    queryKey: ["translation-job", jobId],
    queryFn: async () => {
      if (!jobId) throw new Error("Job ID required");
      
      const { data, error } = await supabase
        .from("translation_jobs" as any)
        .select("*")
        .eq("id", jobId)
        .single();

      if (error) throw error;
      return data as any;
    },
    enabled: !!jobId,
  });

  const { data: history } = useQuery({
    queryKey: ["translation-job-history", jobId],
    queryFn: async () => {
      if (!jobId) throw new Error("Job ID required");
      
      const { data, error } = await supabase
        .from("translation_job_history" as any)
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any;
    },
    enabled: !!jobId,
  });

  const transitionWorkflow = useMutation({
    mutationFn: async ({ 
      action, 
      data 
    }: { 
      action: string; 
      data?: any 
    }) => {
      if (!jobId) throw new Error("Job ID required");

      const { data: result, error } = await supabase.functions.invoke(
        "translation-workflow",
        {
          body: {
            jobId,
            action,
            data,
          },
        }
      );

      if (error) throw error;
      return result;
    },
    onSuccess: (data, variables) => {
      toast.success("Workflow updated", {
        description: `Stage: ${data.workflow_stage}`,
      });
      queryClient.invalidateQueries({ queryKey: ["translation-job", jobId] });
      queryClient.invalidateQueries({ queryKey: ["translation-job-history", jobId] });
      queryClient.invalidateQueries({ queryKey: ["translation-jobs"] });
    },
    onError: (error: any) => {
      toast.error("Workflow transition failed", {
        description: error.message || "Could not update workflow",
      });
    },
  });

  return {
    job,
    history,
    isLoading,
    transitionWorkflow: transitionWorkflow.mutate,
    isTransitioning: transitionWorkflow.isPending,
  };
}

/**
 * Hook to get all translation jobs for a case
 */
export function useTranslationJobs(caseId: string | undefined) {
  return useQuery({
    queryKey: ["translation-jobs", caseId],
    queryFn: async () => {
      if (!caseId) throw new Error("Case ID required");
      
      const { data, error } = await supabase
        .from("translation_jobs" as any)
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any;
    },
    enabled: !!caseId,
  });
}
