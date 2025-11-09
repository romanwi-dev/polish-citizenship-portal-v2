import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { POAGenerationRequestSchema, type POAType, type POAGenerationResponse } from '@/types/poa';
import { createSafeError, logDetailedError } from '@/utils/secureErrorHandling';

interface GenerateMultiPOAParams {
  caseId: string;
  poaTypes: POAType[];
}

interface POAGenerationResult {
  poaType: POAType;
  success: boolean;
  poaId?: string;
  pdfUrl?: string;
  error?: string;
}

/**
 * Hook for secure multi-POA generation
 * 
 * Security features:
 * - Input validation with Zod schemas
 * - Rate limiting enforced by edge function
 * - Batch error handling
 * - Secure error messages
 */
export function useMultiPOAGeneration() {
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<Record<POAType, 'pending' | 'loading' | 'success' | 'error'>>({} as any);

  const generateMultiplePOAs = useMutation({
    mutationFn: async ({ caseId, poaTypes }: GenerateMultiPOAParams): Promise<POAGenerationResult[]> => {
      const results: POAGenerationResult[] = [];

      // Initialize progress
      const initialProgress: Record<POAType, 'pending' | 'loading' | 'success' | 'error'> = {} as any;
      poaTypes.forEach(type => {
        initialProgress[type] = 'pending';
      });
      setProgress(initialProgress);

      // Generate POAs sequentially to respect rate limits
      for (const poaType of poaTypes) {
        setProgress(prev => ({ ...prev, [poaType]: 'loading' }));

        try {
          // Security: Validate input with Zod
          const validationResult = POAGenerationRequestSchema.safeParse({
            caseId,
            poaType,
          });

          if (!validationResult.success) {
            logDetailedError('POA Generation', validationResult.error, { caseId, poaType });
            results.push({
              poaType,
              success: false,
              error: 'Invalid request parameters',
            });
            setProgress(prev => ({ ...prev, [poaType]: 'error' }));
            continue;
          }

          // Call edge function with security headers
          const { data, error } = await supabase.functions.invoke('generate-poa', {
            body: validationResult.data,
          });

          if (error) {
            logDetailedError('POA Generation', error, { caseId, poaType });
            
            // Security: Handle rate limit errors specifically
            if (error.message?.includes('rate limit') || error.message?.includes('429')) {
              results.push({
                poaType,
                success: false,
                error: 'Rate limit exceeded. Please wait before generating more POAs.',
              });
            } else {
              results.push({
                poaType,
                success: false,
                error: createSafeError(error).message,
              });
            }
            setProgress(prev => ({ ...prev, [poaType]: 'error' }));
            continue;
          }

          // Success
          results.push({
            poaType,
            success: true,
            poaId: data.poaId,
            pdfUrl: data.pdfUrl,
          });
          setProgress(prev => ({ ...prev, [poaType]: 'success' }));

        } catch (error) {
          logDetailedError('POA Generation', error, { caseId, poaType });
          results.push({
            poaType,
            success: false,
            error: 'An unexpected error occurred',
          });
          setProgress(prev => ({ ...prev, [poaType]: 'error' }));
        }
      }

      return results;
    },
    onSuccess: (results) => {
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      if (successCount > 0) {
        toast.success(`${successCount} POA(s) generated successfully`);
      }
      if (failCount > 0) {
        toast.error(`${failCount} POA(s) failed to generate`);
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['poa'] });
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
    onError: (error) => {
      logDetailedError('Multi-POA Generation', error);
      toast.error('Failed to generate POAs. Please try again.');
    },
  });

  return {
    generateMultiplePOAs: generateMultiplePOAs.mutate,
    isGenerating: generateMultiplePOAs.isPending,
    progress,
    reset: () => setProgress({} as any),
  };
}

/**
 * Hook for fetching POA documents for a case
 */
export { usePOADocuments } from './usePOADocuments';
