import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Real-time sync hook that listens to master_table changes
 * and automatically updates all forms across the application
 */
export const useRealtimeFormSync = (caseId: string | undefined) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!caseId || caseId === ':id') return;

    // Subscribe to master_table changes for this case
    const channel = supabase
      .channel(`master_table_${caseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'master_table',
          filter: `case_id=eq.${caseId}`
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          
          // Invalidate all form queries to trigger refetch
          queryClient.invalidateQueries({ queryKey: ['masterData', caseId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseId, queryClient]);
};
