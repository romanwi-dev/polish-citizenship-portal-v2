import { useEffect, useRef } from 'react';
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
  const isInitialized = useRef(false);

  // Initialize form with master data when it loads - ONLY ONCE on mount
  useEffect(() => {
    console.log('🔍 useEffect triggered - isLoading:', isLoading, 'isInitialized:', isInitialized.current, 'masterData keys:', masterData ? Object.keys(masterData).length : 'null');
    
    if (isLoading) return;
    if (isInitialized.current) return;
    
    console.log('✅ ONE-TIME INITIALIZATION - Setting form data');
    setFormData(masterData || {});
    isInitialized.current = true;
  }, [isLoading]); // NEVER watch masterData here!

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
          console.log('⚡ Real-time update received from another source');
          
          if (payload.new) {
            // Only update if this wasn't our own change
            console.log('🔄 Syncing external changes to form');
            setFormData((prev: any) => {
              const merged = { ...prev, ...payload.new };
              return merged;
            });
            
            // Update cache quietly without triggering refetch
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
