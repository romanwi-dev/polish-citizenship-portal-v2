import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Real-time sync hook that listens to master_table changes
 * and instantly updates all forms via direct state injection
 */
export const useRealtimeFormSync = (
  caseId: string | undefined, 
  setFormData: (data: any) => void
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!caseId || caseId === ':id') return;

    console.log(`🔄 Realtime sync enabled for case: ${caseId}`);

    // Subscribe to master_table changes for this case
    const channel = supabase
      .channel(`master_table_sync_${caseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'master_table',
          filter: `case_id=eq.${caseId}`
        },
        (payload) => {
          console.log('⚡ Real-time update received:', payload);
          
          if (payload.eventType === 'UPDATE' && payload.new) {
            // Directly update form state - INSTANT sync
            setFormData((prev: any) => ({
              ...prev,
              ...payload.new
            }));
            
            // Also update React Query cache
            queryClient.setQueryData(['masterData', caseId], payload.new);
            
            console.log('✅ Form data synced instantly');
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Realtime channel status: ${status}`);
      });

    return () => {
      console.log(`🔌 Disconnecting realtime for case: ${caseId}`);
      supabase.removeChannel(channel);
    };
  }, [caseId, queryClient, setFormData]);
};
