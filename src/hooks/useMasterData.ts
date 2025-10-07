import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useMasterData = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ["masterData", caseId],
    queryFn: async () => {
      if (!caseId) throw new Error("Case ID is required");

      const { data, error } = await supabase
        .from("master_table")
        .select("*")
        .eq("case_id", caseId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!caseId,
    staleTime: 30000,
  });
};

export const useUpdateMasterData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, updates }: { caseId: string; updates: any }) => {
      // Check if record exists
      const { data: existing } = await supabase
        .from("master_table")
        .select("id")
        .eq("case_id", caseId)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from("master_table")
          .update(updates)
          .eq("case_id", caseId);
        
        if (error) throw error;
      } else {
        // Insert new
        const { error } = await supabase
          .from("master_table")
          .insert({ case_id: caseId, ...updates });
        
        if (error) throw error;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["masterData", variables.caseId] });
      toast.success("Master data updated successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });
};
