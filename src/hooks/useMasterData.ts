import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useMasterData = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ["masterData", caseId],
    queryFn: async () => {
      if (!caseId || caseId === ':id') throw new Error("Invalid case ID");

      console.log('🔍 Fetching master data for case:', caseId);

      const { data, error } = await supabase
        .from("master_table")
        .select("*")
        .eq("case_id", caseId)
        .maybeSingle();

      if (error) throw error;
      
      console.log('✅ Master data fetched:', data);
      return data;
    },
    enabled: !!caseId && caseId !== ':id',
    staleTime: 30000,
  });
};

export const useUpdateMasterData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, updates }: { caseId: string; updates: any }) => {
      // Validate caseId
      if (!caseId || caseId === ':id') {
        throw new Error("Invalid case ID");
      }

      console.log('💾 Saving to master_table for case:', caseId, 'Updates:', updates);

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
        console.log('✅ Updated existing record');
      } else {
        // Insert new
        const { error } = await supabase
          .from("master_table")
          .insert({ case_id: caseId, ...updates });
        
        if (error) throw error;
        console.log('✅ Inserted new record');
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
