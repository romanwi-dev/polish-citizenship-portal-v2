import { supabase } from "@/integrations/supabase/client";

export interface VerificationResult {
  overall_score: number;
  confidence_level: 'high' | 'medium' | 'low';
  verified_findings: Array<{
    finding: string;
    verified: boolean;
    severity_accurate: boolean;
    evidence: string;
    score: number;
  }>;
  missed_issues: string[];
  incorrect_assumptions: string[];
  recommendation: 'approve' | 'revise' | 'reject';
  reasoning: string;
}

export interface TripleVerificationResponse {
  success: boolean;
  gpt5: VerificationResult;
  gemini: VerificationResult;
  claude?: VerificationResult;
  consensus: {
    average_score: number;
    score_difference: number;
    max_score_difference?: number;
    agreement_level: 'high' | 'medium' | 'low';
    unanimous_approval: boolean;
    all_scores_above_80: boolean;
    all_scores_at_100?: boolean;
  };
  verdict: 'PROCEED_TO_EX' | 'REVISE_ANALYSIS';
  timestamp: string;
}

export async function runTripleVerification(
  analysis: string,
  context: string
): Promise<TripleVerificationResponse> {
  console.log('🚀 Initiating A→B→EX Triple Verification...');
  
  const { data, error } = await supabase.functions.invoke('triple-verify-analysis', {
    body: { analysis, context }
  });

  if (error) {
    console.error('❌ Verification failed:', error);
    throw new Error(`Verification failed: ${error.message}`);
  }

  if (!data.success) {
    throw new Error(`Verification error: ${data.error}`);
  }

  console.log('✅ Triple verification complete');
  console.log('📊 Results:', {
    gpt5_score: data.gpt5.overall_score,
    gemini_score: data.gemini.overall_score,
    consensus: data.consensus.average_score,
    verdict: data.verdict
  });

  return data;
}
