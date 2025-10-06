import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useUpdateProcessingMode = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ caseId, processingMode }: { caseId: string; processingMode: string }) => {
      const { error } = await supabase
        .from("cases")
        .update({ processing_mode: processingMode as any })
        .eq("id", caseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("Processing mode updated");
    },
    onError: (error: any) => {
      toast.error(`Failed to update processing mode: ${error.message}`);
    },
  });
};

export const useUpdateClientScore = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ caseId, score }: { caseId: string; score: number }) => {
      const { error } = await supabase
        .from("cases")
        .update({ client_score: score })
        .eq("id", caseId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      toast.success("Client score updated");
    },
    onError: (error: any) => {
      toast.error(`Failed to update client score: ${error.message}`);
    },
  });
};
