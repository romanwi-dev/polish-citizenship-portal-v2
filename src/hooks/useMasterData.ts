import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sanitizeMasterData } from "@/utils/masterDataSanitizer";

export const useMasterData = (caseId: string | undefined) => {
  return useQuery({
    queryKey: ["masterData", caseId],
    queryFn: async () => {
      if (!caseId || caseId === ':id') throw new Error("Invalid case ID");

      // Handle demo case - return empty data without DB fetch
      if (caseId === 'demo-preview') {
        return {};
      }

      // Removed production console.log

      const { data, error } = await supabase
        .from("master_table")
        .select("*")
        .eq("case_id", caseId)
        .maybeSingle();

      if (error) {
        console.error('❌ DB FETCH ERROR:', error);
        throw error;
      }
      
      // Removed production console.log
      return data;
    },
    enabled: !!caseId && caseId !== ':id',
    // For demo-preview, load instantly
    initialData: caseId === 'demo-preview' ? {} : undefined,
    // Always fetch fresh data - no caching issues
    staleTime: 0, // Always considered stale
    gcTime: 0, // Don't keep in cache
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

      // Handle demo case - skip DB operations
      if (caseId === 'demo-preview') {
        return; // Just return without saving
      }

      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to save data. Please log in and try again.");
      }

      console.log('💾 [useMasterData] RAW updates received:', Object.keys(updates).length, 'fields');
      
      const sanitizedUpdates = sanitizeMasterData(updates);
      
      console.log('💾 [useMasterData] After sanitization:', Object.keys(sanitizedUpdates).length, 'fields');

      const { data: existing, error: checkError } = await supabase
        .from("master_table")
        .select("id")
        .eq("case_id", caseId)
        .maybeSingle();

      if (checkError) {
        console.error('❌ CHECK ERROR:', checkError);
        throw new Error(`Database error: ${checkError.message}`);
      }

      if (existing) {
        console.log('💾 [useMasterData] Updating existing record...');
        const { error } = await supabase
          .from("master_table")
          .update(sanitizedUpdates)
          .eq("case_id", caseId);
        
        if (error) {
          console.error('❌ UPDATE ERROR:', error);
          console.error('❌ Failed fields:', sanitizedUpdates);
          if (error.code === '42501') {
            throw new Error("Permission denied. Please ensure you're logged in as an admin or assistant.");
          }
          throw new Error(`Update failed: ${error.message}`);
        }
        console.log('✅ [useMasterData] Update successful');
      } else {
        console.log('💾 [useMasterData] Inserting new record...');
        const { error } = await supabase
          .from("master_table")
          .insert({ case_id: caseId, ...sanitizedUpdates });
        
        if (error) {
          console.error('❌ INSERT ERROR:', error);
          console.error('❌ Failed data:', { case_id: caseId, ...sanitizedUpdates });
          if (error.code === '42501') {
            throw new Error("Permission denied. Please ensure you're logged in as an admin or assistant.");
          }
          throw new Error(`Insert failed: ${error.message}`);
        }
        console.log('✅ [useMasterData] Insert successful');
      }
    },
    onSuccess: (_, variables) => {
      // Skip DB operations for demo
      if (variables.caseId === 'demo-preview') {
        toast.success("Demo mode - changes not saved");
        return;
      }
      
      // Force refetch of data after save
      queryClient.invalidateQueries({ queryKey: ['masterData', variables.caseId] });
      toast.success("Data saved successfully");
    },
    onError: (error: any) => {
      console.error('❌ SAVE FAILED:', error);
      toast.error(error.message || "Failed to save data");
    },
  });
};
