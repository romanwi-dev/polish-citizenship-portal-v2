import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sanitizeMasterData } from "@/utils/masterDataSanitizer";

export const useMasterData = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ["masterData", caseId],
    queryFn: async () => {
      if (!caseId || caseId === ':id') throw new Error("Invalid case ID");

      console.log('🔍 FETCHING FRESH DATA FROM DB - Case:', caseId);

      const { data, error } = await supabase
        .from("master_table")
        .select("*")
        .eq("case_id", caseId)
        .maybeSingle();

      if (error) {
        console.error('❌ DB FETCH ERROR:', error);
        throw error;
      }
      
      console.log('✅ FRESH DATA FROM DB:', data ? Object.keys(data).length + ' fields' : 'NO DATA');
      return data;
    },
    enabled: !!caseId && caseId !== ':id',
    // NO CACHING BUT NO CONSTANT REFETCHING
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
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

      console.log('💾 SAVING TO DB - Case:', caseId);
      console.log('📦 Updates:', Object.keys(updates).length, 'fields');

      const sanitizedUpdates = sanitizeMasterData(updates);
      console.log('🧹 After sanitization:', Object.keys(sanitizedUpdates).length, 'fields');

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
          console.error('❌ UPDATE ERROR:', error);
          throw error;
        }
      } else {
        const { error } = await supabase
          .from("master_table")
          .insert({ case_id: caseId, ...sanitizedUpdates });
        
        if (error) {
          console.error('❌ INSERT ERROR:', error);
          throw error;
        }
      }

      console.log('✅ SAVED TO DB SUCCESSFULLY');
    },
    onSuccess: (_, variables) => {
      console.log('✅ Data saved - NOT refetching (realtime will handle updates)');
      // DO NOT refetch - let realtime sync handle it
      toast.success("Master data updated successfully");
    },
    onError: (error: any) => {
      console.error('❌ SAVE FAILED:', error);
      toast.error(`Failed to update: ${error.message}`);
    },
  });
};
