import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Real-time sync hook that listens to master_table changes
 * and instantly updates all forms via direct state injection
 */
export const useRealtimeFormSync = (
  caseId: string | undefined, 
  masterData: any,
  isLoading: boolean,
  setFormData: React.Dispatch<React.SetStateAction<any>>
) => {
  const queryClient = useQueryClient();

  // Initialize form with master data when it loads
  useEffect(() => {
    if (isLoading || !masterData) {
      console.log('⏳ Waiting for data...', { isLoading, hasData: !!masterData });
      return;
    }
    
    console.log('📥 Initializing form with existing data:', Object.keys(masterData).length, 'fields');
    setFormData(masterData);
  }, [masterData, isLoading]);

  // Real-time sync
  useEffect(() => {
    if (!caseId || caseId === ':id') return;

    console.log(`🔄 Realtime sync enabled for case: ${caseId}`);

    const channel = supabase
      .channel(`master_table_sync_${caseId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'master_table',
          filter: `case_id=eq.${caseId}`
        },
        (payload) => {
          console.log('⚡ Real-time update received:', payload);
          
          if (payload.new) {
            console.log('🔄 Merging new data with existing form state');
            setFormData((prev: any) => {
              const merged = { ...prev, ...payload.new };
              console.log('✅ Form updated -', Object.keys(payload.new).length, 'fields changed');
              return merged;
            });
            
            queryClient.setQueryData(['masterData', caseId], payload.new);
          }
        }
      )
      .subscribe((status) => {
        console.log(`📡 Realtime status: ${status}`);
      });

    return () => {
      console.log(`🔌 Disconnecting realtime for: ${caseId}`);
      supabase.removeChannel(channel);
    };
  }, [caseId, queryClient, setFormData]);
};
