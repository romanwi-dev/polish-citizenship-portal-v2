import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook for real-time form synchronization
 * Listens to master_table updates and syncs form data
 */
export const useRealtimeFormSync = (
  caseId: string | undefined,
  masterData: any,
  isLoading: boolean,
  setFormData: React.Dispatch<React.SetStateAction<any>>
) => {
  const queryClient = useQueryClient();

  // Initialize form data from master_table
  useEffect(() => {
    if (!isLoading && masterData && caseId) {
      setFormData(masterData);
    }
  }, [masterData, isLoading, caseId, setFormData]);

  // Real-time subscription to master_table changes
  useEffect(() => {
    if (!caseId) return;

    const channel = supabase
      .channel(`master_table_${caseId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'master_table',
          filter: `case_id=eq.${caseId}`,
        },
        (payload) => {
          const newData = payload.new;
          
          // Smart merge: Only update fields that are null/undefined locally
          // This prevents clearing actively edited or recently saved fields
          setFormData((prev: any) => {
            const merged = { ...prev };
            
            Object.entries(newData).forEach(([key, value]) => {
              // Skip system fields
              if (key === 'id' || key === 'case_id' || key === 'created_at' || key === 'updated_at') {
                return;
              }
              
              // Only accept remote updates for fields that are empty/undefined locally
              // This prevents data from being cleared after save
              if (prev[key] === null || prev[key] === undefined || prev[key] === '') {
                merged[key] = value;
              }
              // Otherwise keep local value to preserve user edits
            });
            
            return merged;
          });

          // Update React Query cache
          queryClient.setQueryData(['masterData', caseId], newData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseId, setFormData, queryClient]);
};
