import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sanitizeMasterData } from "@/utils/masterDataSanitizer";

export const useMasterData = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ["masterData", caseId],
    queryFn: async () => {
      if (!caseId || caseId === ':id') throw new Error("Invalid case ID");

      console.log('🔍 Fetching FRESH master data for case:', caseId);

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
    staleTime: 0, // Always consider data stale
    gcTime: 0, // Don't cache after unmount
    refetchOnMount: 'always', // Always refetch on mount
    refetchOnWindowFocus: true, // Refetch when window gains focus
    refetchOnReconnect: true, // Refetch on reconnect
  });
};

export const useUpdateMasterData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, updates }: { caseId: string; updates: any }) => {
      console.log('🚀 MUTATION CALLED - caseId:', caseId, 'updates:', updates);
      
      // Validate caseId
      if (!caseId || caseId === ':id') {
        console.error('❌ Invalid case ID:', caseId);
        throw new Error("Invalid case ID");
      }

      // Sanitize updates to remove UI-only fields
      const sanitizedUpdates = sanitizeMasterData(updates);

      console.log('💾 Saving to master_table for case:', caseId);
      console.log('📝 Sanitized updates:', sanitizedUpdates);

      // Check if record exists
      const { data: existing, error: checkError } = await supabase
        .from("master_table")
        .select("id")
        .eq("case_id", caseId)
        .maybeSingle();

      if (checkError) {
        console.error('❌ Error checking existing record:', checkError);
        throw checkError;
      }

      if (existing) {
        console.log('📝 Updating existing record:', existing.id);
        // Update existing
        const { error } = await supabase
          .from("master_table")
          .update(sanitizedUpdates)
          .eq("case_id", caseId);
        
        if (error) {
          console.error('❌ Update error:', error);
          throw error;
        }
        console.log('✅ Updated existing record successfully');
      } else {
        console.log('➕ Inserting new record');
        // Insert new
        const { error } = await supabase
          .from("master_table")
          .insert({ case_id: caseId, ...sanitizedUpdates });
        
        if (error) {
          console.error('❌ Insert error:', error);
          throw error;
        }
        console.log('✅ Inserted new record successfully');
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
