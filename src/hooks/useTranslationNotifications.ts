import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TranslationJobChange {
  new: {
    id: string;
    workflow_stage: string;
    case_id: string;
    document_name: string;
    source_language: string;
    target_language: string;
    ai_confidence_score?: number;
  };
  old: {
    workflow_stage: string;
  };
}

export const useTranslationNotifications = () => {
  const [pendingReviewCount, setPendingReviewCount] = useState<number>(0);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Fetch initial count of pending reviews
    const fetchPendingCount = async () => {
      const { data, error } = await supabase
        .from('translation_jobs' as any)
        .select('id', { count: 'exact', head: true })
        .eq('workflow_stage', 'ai_complete');
      
      if (!error && data) {
        setPendingReviewCount((data as any[]).length || 0);
      }
    };

    fetchPendingCount();

    // Set up realtime subscription
    const channel = supabase
      .channel('translation-notifications')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'translation_jobs',
        },
        (payload) => {
          const change = payload as unknown as TranslationJobChange;
          
          // Check if job transitioned to ai_complete (needs HAC review)
          if (
            change.new.workflow_stage === 'ai_complete' &&
            change.old.workflow_stage !== 'ai_complete'
          ) {
            // Show toast notification
            toast.success('AI Translation Complete', {
              description: `${change.new.document_name} is ready for HAC review`,
              action: {
                label: 'Review',
                onClick: () => {
                  // Navigate to translations workflow
                  window.location.href = '/admin/translations-workflow';
                },
              },
              duration: 10000,
            });

            // Update pending count
            setPendingReviewCount((prev) => prev + 1);

            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['translation-workflow-counts'] });
            queryClient.invalidateQueries({ queryKey: ['translation-jobs'] });
          }

          // Check if job moved away from ai_complete
          if (
            change.old.workflow_stage === 'ai_complete' &&
            change.new.workflow_stage !== 'ai_complete'
          ) {
            setPendingReviewCount((prev) => Math.max(0, prev - 1));
            queryClient.invalidateQueries({ queryKey: ['translation-workflow-counts'] });
            queryClient.invalidateQueries({ queryKey: ['translation-jobs'] });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { pendingReviewCount };
};
