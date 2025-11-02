import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TransitionWorkflowParams {
  workflowInstanceId: string;
  toStage: string;
  reason?: string;
}

export const useWorkflowTransition = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ workflowInstanceId, toStage, reason }: TransitionWorkflowParams) => {
      const { data, error } = await supabase.rpc('transition_workflow_stage', {
        p_workflow_instance_id: workflowInstanceId,
        p_to_stage: toStage,
        p_reason: reason || null,
      });

      if (error) throw error;
      
      const result = data as any;
      
      if (!result?.success) {
        throw new Error(result?.error || 'Transition failed');
      }

      return result;
    },
    onSuccess: (data: any) => {
      toast.success(`Workflow transitioned: ${data.from_stage} → ${data.to_stage}`);
      
      // Invalidate all workflow-related queries
      queryClient.invalidateQueries({ queryKey: ['workflow-instances'] });
      queryClient.invalidateQueries({ queryKey: ['translation-workflows'] });
      queryClient.invalidateQueries({ queryKey: ['translation-requests'] });
      queryClient.invalidateQueries({ queryKey: ['archive-searches'] });
      queryClient.invalidateQueries({ queryKey: ['usc-requests'] });
      queryClient.invalidateQueries({ queryKey: ['passport-applications'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
    onError: (error: Error) => {
      toast.error(`Transition failed: ${error.message}`);
    },
  });
};
