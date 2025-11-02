/**
 * Hook for inline AI verification using OpenAI via verify-changes edge function
 */

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChangeProposal, VerificationResult } from "@/utils/verificationWorkflow";

interface UseInlineVerificationReturn {
  verify: (proposal: ChangeProposal) => Promise<void>;
  isVerifying: boolean;
  result: VerificationResult | null;
  error: string | null;
  clearResult: () => void;
}

export function useInlineVerification(): UseInlineVerificationReturn {
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const verify = async (proposal: ChangeProposal) => {
    setIsVerifying(true);
    setError(null);
    setResult(null);

    try {
      console.log('🤖 Calling OpenAI for verification...', { proposal });

      const { data, error: functionError } = await supabase.functions.invoke('verify-changes', {
        body: { proposal }
      });

      if (functionError) {
        console.error('Verification function error:', functionError);
        throw new Error(`Verification failed: ${functionError.message}`);
      }

      if (!data?.review) {
        throw new Error('No review data received from OpenAI');
      }

      console.log('✅ OpenAI verification complete:', data.review);
      setResult(data.review);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown verification error';
      console.error('Verification error:', err);
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  return {
    verify,
    isVerifying,
    result,
    error,
    clearResult
  };
}
