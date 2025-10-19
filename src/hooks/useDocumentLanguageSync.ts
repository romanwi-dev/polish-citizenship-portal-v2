import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { detectDocumentLanguage, requiresTranslation } from '@/utils/documentLanguageDetector';
import { toast } from 'sonner';

/**
 * Hook to sync document language detection with database
 * Automatically detects language when documents are uploaded
 */
export function useDocumentLanguageSync(caseId: string | undefined) {
  useEffect(() => {
    if (!caseId) return;

    const channel = supabase
      .channel(`doc-language-sync-${caseId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'documents',
          filter: `case_id=eq.${caseId}`
        },
        async (payload) => {
          const newDoc = payload.new;
          
          // Skip if language already set
          if (newDoc.language && newDoc.language !== 'UNKNOWN') {
            return;
          }

          // Detect language from document name and OCR text
          const detectedLanguage = detectDocumentLanguage(newDoc.ocr_text || newDoc.name);
          const needsTranslation = requiresTranslation(detectedLanguage);

          // Update document with detected language
          const { error } = await supabase
            .from('documents')
            .update({
              language: detectedLanguage,
              needs_translation: needsTranslation,
            })
            .eq('id', newDoc.id);

          if (error) {
            console.error('Failed to update document language:', error);
          } else if (needsTranslation) {
            toast.info(`Document needs translation from ${detectedLanguage} to Polish`, {
              description: newDoc.name,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseId]);
}
