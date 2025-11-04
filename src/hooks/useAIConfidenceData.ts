import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface AIConfidence {
  documentId: string;
  documentName: string;
  classification: {
    documentType: string;
    personType: string;
    confidence: number;
    alternatives?: Array<{ type: string; confidence: number }>;
  };
  aiProvider: 'gemini' | 'gpt-5';
  reasoning?: string;
  timestamp: string;
  humanVerified?: boolean;
  humanFeedback?: 'correct' | 'incorrect';
}

export function useAIConfidenceData(caseId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch documents with AI classification data
  const { data: confidenceData = [], isLoading } = useQuery({
    queryKey: ['ai-confidence-data', caseId],
    queryFn: async () => {
      if (!caseId) return [];

      const { data: documents, error } = await supabase
        .from('documents')
        .select('id, name, document_type, person_type, ai_detected_type, ai_detected_person, detection_confidence, metadata, created_at')
        .eq('case_id', caseId)
        .not('ai_detected_type', 'is', null);

      if (error) throw error;

      // Check for human overrides
      const { data: overrides } = await supabase
        .from('ai_confidence_overrides')
        .select('*')
        .eq('case_id', caseId);

      const overrideMap = new Map(
        overrides?.map(o => [o.document_id, o]) || []
      );

      return documents.map(doc => {
        const override = overrideMap.get(doc.id);
        const metadata = doc.metadata as any || {};
        
        return {
          documentId: doc.id,
          documentName: doc.name,
          classification: {
            documentType: doc.document_type || doc.ai_detected_type || 'Unknown',
            personType: doc.person_type || doc.ai_detected_person || 'Unknown',
            confidence: doc.detection_confidence || 0,
            alternatives: metadata.ai_alternatives || [],
          },
          aiProvider: (metadata.ai_provider || 'gemini') as 'gemini' | 'gpt-5',
          reasoning: metadata.ai_reasoning,
          timestamp: doc.created_at,
          humanVerified: override ? true : false,
          humanFeedback: override?.human_override as 'correct' | 'incorrect' | undefined,
        } as AIConfidence;
      });
    },
    enabled: !!caseId,
  });

  // Verify AI classification
  const verifyMutation = useMutation({
    mutationFn: async ({ documentId, feedback }: { documentId: string; feedback: 'correct' | 'incorrect' }) => {
      if (!caseId) throw new Error('Case ID required');

      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      const { error } = await supabase
        .from('ai_confidence_overrides')
        .upsert({
          document_id: documentId,
          case_id: caseId,
          human_override: feedback,
          ai_classification: '', // Will be filled from document data
          ai_confidence: 0, // Will be filled from document data
          ai_detected_person: '', // Will be filled from document data
          human_classification: '',
          verified_at: new Date().toISOString(),
          verified_by: userId || '',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-confidence-data', caseId] });
      toast({
        title: "Verification Saved",
        description: "AI classification feedback recorded.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    confidenceData,
    isLoading,
    verifyClassification: verifyMutation.mutate,
  };
}
