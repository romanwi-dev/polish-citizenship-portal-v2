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
      // Smart merge: Don't overwrite existing form data with null/empty values from DB
      setFormData((prev: any) => {
        // If no previous data, use masterData as-is
        if (!prev || Object.keys(prev).length === 0) {
          return masterData;
        }
        
        // Merge intelligently: preserve local values unless DB has a non-null value
        const merged = { ...prev };
        Object.entries(masterData).forEach(([key, value]) => {
          // Skip system fields
          if (key === 'id' || key === 'case_id' || key === 'created_at' || key === 'updated_at') {
            return;
          }
          
          // Only update if DB has a value AND (local is empty OR this is initial load)
          if (value !== null && value !== undefined && value !== '') {
            merged[key] = value;
          } else if (prev[key] === undefined) {
            // If local doesn't have this field at all, set it (even if null)
            merged[key] = value;
          }
          // Otherwise preserve local value
        });
        
        return merged;
      });
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
 
          // Update React Query cache with smart merge (don't replace entire cache)
          queryClient.setQueryData(['masterData', caseId], (oldData: any) => {
            if (!oldData) return newData;
            
            // Merge new data into old data, preserving non-null values
            const merged = { ...oldData };
            Object.entries(newData).forEach(([key, value]) => {
              if (key === 'id' || key === 'case_id' || key === 'created_at' || key === 'updated_at') {
                merged[key] = value;
              } else if (value !== null && value !== undefined && value !== '') {
                merged[key] = value;
              }
              // Preserve oldData value if newData has null/empty
            });
            return merged;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseId, setFormData, queryClient]);
};
