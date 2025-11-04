import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { detectDocumentLanguage, requiresTranslation, getLanguageName } from '@/utils/documentLanguageDetector';
import { toast } from 'sonner';

/**
 * Hook to sync document language detection with database
 * Automatically detects language when documents are uploaded and creates translation tasks
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
              translation_required: needsTranslation,
            })
            .eq('id', newDoc.id);

          if (error) {
            console.error('Failed to update document language:', error);
            return;
          }

          // Auto-create translation task if needed
          if (needsTranslation) {
            const languageName = getLanguageName(detectedLanguage);
            
            // Create translation task
            const { error: taskError } = await supabase
              .from('tasks')
              .insert({
                case_id: caseId,
                related_document_id: newDoc.id,
                task_type: 'translation',
                title: `Translate ${newDoc.document_type || 'Document'} from ${languageName}`,
                description: `Document "${newDoc.name}" requires translation from ${languageName} to Polish. Person: ${newDoc.person_type || 'Unknown'}`,
                priority: 'high',
                status: 'pending',
                related_person: newDoc.person_type,
                metadata: {
                  source_language: detectedLanguage,
                  target_language: 'PL',
                  document_name: newDoc.name,
                  auto_created: true,
                  created_by_system: 'language_detection',
                }
              });

            if (taskError) {
              console.error('Failed to create translation task:', taskError);
              toast.error('Failed to create translation task', {
                description: `Document detected as ${languageName} but task creation failed`,
              });
            } else {
              toast.info(`Translation task created for ${languageName} document`, {
                description: newDoc.name,
                duration: 5000,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [caseId]);
}
