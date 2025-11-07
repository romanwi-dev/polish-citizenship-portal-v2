import { supabase } from "@/integrations/supabase/client";

export interface PhaseAAnalysis {
  domain: string;
  totalIssues: number;
  criticalIssues: string[];
  warnings: string[];
  rootCause: string;
  proposedSolution: string;
  analysisText: string;
}

export interface PhaseBResult {
  passed: boolean;
  overallScore: number;
  confidence: number;
  scoreVariance: number;
  consensus: 'strong' | 'moderate' | 'weak';
  models: Array<{
    model: string;
    score: number;
    confidence: number;
    criticalIssues: string[];
    recommendations: string[];
    reasoning: string;
  }>;
  aggregatedFindings: {
    criticalIssues: string[];
    consensusRecommendations: string[];
    totalIssuesFound: number;
  };
  recommendation: string;
  timestamp: string;
}

export async function runPhaseB(analysis: PhaseAAnalysis): Promise<PhaseBResult> {
  const { data, error } = await supabase.functions.invoke('verify-analysis', {
    body: {
      analysis: analysis.analysisText,
      domain: analysis.domain,
      criticalFindings: analysis.criticalIssues
    }
  });

  if (error) {
    throw new Error(`Phase B verification failed: ${error.message}`);
  }

  return data.verification ? data : data;
}
