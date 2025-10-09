import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sanitizeMasterData } from "@/utils/masterDataSanitizer";

export const useMasterData = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ["masterData", caseId],
    queryFn: async () => {
      if (!caseId || caseId === ':id') throw new Error("Invalid case ID");

      const { data, error } = await supabase
        .from("master_table")
        .select("*")
        .eq("case_id", caseId)
        .maybeSingle();

      if (error) throw error;
      
      return data;
    },
    enabled: !!caseId && caseId !== ':id',
    staleTime: 0, // Always fetch fresh data
    gcTime: 0, // Don't cache after unmount
    refetchOnMount: true, // Always refetch on mount
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useUpdateMasterData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, updates }: { caseId: string; updates: any }) => {
      if (!caseId || caseId === ':id') {
        throw new Error("Invalid case ID");
      }

      const sanitizedUpdates = sanitizeMasterData(updates);

      const { data: existing, error: checkError } = await supabase
        .from("master_table")
        .select("id")
        .eq("case_id", caseId)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existing) {
        const { error } = await supabase
          .from("master_table")
          .update(sanitizedUpdates)
          .eq("case_id", caseId);
        
        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase
          .from("master_table")
          .insert({ case_id: caseId, ...sanitizedUpdates });
        
        if (error) {
          throw error;
        }
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
