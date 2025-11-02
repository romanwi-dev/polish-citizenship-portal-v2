import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ChangeVerificationDialog } from "@/components/ChangeVerificationDialog";

interface FileChange {
  path: string;
  action: 'edit' | 'create' | 'delete';
  changes: string;
  linesAffected?: string;
}

interface ChangeProposal {
  type: 'database' | 'edge_function' | 'frontend' | 'mixed';
  description: string;
  impact: string;
  files: FileChange[];
  sql?: string[];
  edgeFunctions?: Array<{
    name: string;
    changes: string;
  }>;
  reasoning: string;
  risks: string[];
  rollbackPlan: string;
}

interface ScoreDetail {
  score: number;
  issues: string[];
}

interface VerificationResult {
  approved: boolean;
  overallScore: number;
  scores: {
    logic: ScoreDetail;
    security: ScoreDetail;
    database: ScoreDetail;
    codeQuality: ScoreDetail;
    performance: ScoreDetail;
    bestPractices: ScoreDetail;
  };
  criticalIssues: string[];
  warnings: string[];
  suggestions: string[];
  recommendation: 'approve' | 'approve_with_changes' | 'reject';
  explanation: string;
}

export default function VerifyChanges() {
  const [searchParams] = useSearchParams();
  const [proposal, setProposal] = useState<ChangeProposal | null>(null);
  const [review, setReview] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Try to load proposal from URL params
    const proposalParam = searchParams.get('proposal');
    if (proposalParam) {
      try {
        const decodedProposal = JSON.parse(atob(proposalParam));
        setProposal(decodedProposal);
        runVerification(decodedProposal);
      } catch (err) {
        setError('Failed to decode proposal from URL');
        console.error('Proposal decode error:', err);
      }
    } else {
      // Try localStorage as fallback
      const storedProposal = localStorage.getItem('pending_proposal');
      if (storedProposal) {
        try {
          const parsedProposal = JSON.parse(storedProposal);
          setProposal(parsedProposal);
          runVerification(parsedProposal);
        } catch (err) {
          setError('Failed to parse proposal from storage');
          console.error('Proposal parse error:', err);
        }
      } else {
        setError('No proposal found. Please provide a proposal via URL parameter or localStorage.');
      }
    }
  }, [searchParams]);

  const runVerification = async (prop: ChangeProposal) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('verify-changes', {
        body: { proposal: prop }
      });

      if (functionError) {
        throw functionError;
      }

      if (data?.success && data?.review) {
        setReview(data.review);
      } else {
        throw new Error(data?.error || 'Verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = () => {
    localStorage.setItem('verification_result', JSON.stringify({
      approved: true,
      timestamp: Date.now()
    }));
    localStorage.removeItem('pending_proposal');
    window.close();
  };

  const handleReject = () => {
    localStorage.setItem('verification_result', JSON.stringify({
      approved: false,
      timestamp: Date.now(),
      review
    }));
    localStorage.removeItem('pending_proposal');
    window.close();
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-destructive/10 border border-destructive rounded-lg p-6">
          <h2 className="text-lg font-semibold text-destructive mb-2">Verification Error</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ChangeVerificationDialog
        open={!!proposal}
        proposal={proposal}
        review={review}
        isLoading={isLoading}
        onApprove={handleApprove}
        onReject={handleReject}
        onOpenChange={() => {}}
      />
    </div>
  );
}
