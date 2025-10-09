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
    if (isLoading) {
      console.log('⏳ Loading data...');
      return;
    }
    
    if (!masterData) {
      console.log('📭 No data in DB - initializing empty form');
      setFormData({});
      return;
    }
    
    console.log('📥 LOADING FRESH DATA FROM DB:', Object.keys(masterData).length, 'fields');
    console.log('📊 Sample DB fields:', {
      applicant_first_name: masterData.applicant_first_name,
      applicant_last_name: masterData.applicant_last_name,
      applicant_email: masterData.applicant_email,
      applicant_passport_number: masterData.applicant_passport_number
    });
    
    // FORCE UPDATE - set ALL masterData as form data
    setFormData(masterData);
  }, [masterData, isLoading, setFormData]);

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
            console.log('🔄 Applying real-time update to form');
            setFormData((prev: any) => {
              const merged = { ...prev, ...payload.new };
              console.log('✅ Form updated -', Object.keys(payload.new).length, 'fields changed');
              return merged;
            });
            
            // Update cache
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
