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
          console.log('Real-time update received:', payload);
          const newData = payload.new;
          
          // Update local form state
          setFormData((prev: any) => ({
            ...prev,
            ...newData,
          }));

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
