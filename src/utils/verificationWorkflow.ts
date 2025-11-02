/**
 * Verification Workflow Utilities
 * Handles AI change verification inline in chat conversations
 */

export interface FileChange {
  path: string;
  action: 'edit' | 'create' | 'delete';
  changes: string;
  linesAffected?: string;
}

export interface ChangeProposal {
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

export interface ScoreDetail {
  score: number;
  issues: string[];
}

export interface VerificationResult {
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

/**
 * Store a proposal for verification
 */
export function storeProposal(proposal: ChangeProposal): void {
  localStorage.setItem('pending_proposal', JSON.stringify(proposal));
  localStorage.setItem('proposal_timestamp', Date.now().toString());
}

/**
 * Get stored proposal
 */
export function getStoredProposal(): ChangeProposal | null {
  const stored = localStorage.getItem('pending_proposal');
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Clear proposal and results
 */
export function clearVerification(): void {
  localStorage.removeItem('pending_proposal');
  localStorage.removeItem('verification_result');
  localStorage.removeItem('proposal_timestamp');
}

/**
 * Get verification result
 */
export function getVerificationResult(): { approved: boolean; review?: VerificationResult } | null {
  const stored = localStorage.getItem('verification_result');
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

/**
 * Store verification to database history
 */
export async function storeVerificationHistory(
  proposal: ChangeProposal,
  review: VerificationResult,
  userDecision: 'approved' | 'rejected' | 'modified',
  caseId?: string
): Promise<void> {
  const { supabase } = await import('@/integrations/supabase/client');
  
  await supabase.from('ai_verifications').insert({
    proposal_type: proposal.type,
    description: proposal.description,
    files_affected: proposal.files.map(f => f.path),
    openai_score: review.overallScore,
    recommendation: review.recommendation,
    critical_issues: review.criticalIssues,
    warnings: review.warnings,
    suggestions: review.suggestions,
    user_decision: userDecision,
    implemented_at: userDecision === 'approved' ? new Date().toISOString() : null,
    case_id: caseId || null
  });
}

/**
 * Format proposal as markdown for chat display
 */
export function formatProposalMarkdown(proposal: ChangeProposal): string {
  let md = `## 📋 Change Proposal\n\n`;
  md += `**Type:** ${proposal.type}\n`;
  md += `**Description:** ${proposal.description}\n`;
  md += `**Impact:** ${proposal.impact}\n\n`;
  
  md += `### Files to Change\n\n`;
  proposal.files.forEach(file => {
    md += `- **${file.path}** (${file.action})\n`;
    md += `  - ${file.changes}\n`;
    if (file.linesAffected) {
      md += `  - Lines: ${file.linesAffected}\n`;
    }
  });
  
  if (proposal.sql && proposal.sql.length > 0) {
    md += `\n### SQL Changes\n\n`;
    proposal.sql.forEach(sql => {
      md += `- ${sql}\n`;
    });
  }
  
  if (proposal.edgeFunctions && proposal.edgeFunctions.length > 0) {
    md += `\n### Edge Functions\n\n`;
    proposal.edgeFunctions.forEach(ef => {
      md += `- **${ef.name}**\n`;
      md += `  - ${ef.changes}\n`;
    });
  }
  
  md += `\n### Reasoning\n\n${proposal.reasoning}\n`;
  
  md += `\n### Identified Risks\n\n`;
  proposal.risks.forEach(risk => {
    md += `- ${risk}\n`;
  });
  
  md += `\n### Rollback Plan\n\n${proposal.rollbackPlan}\n`;
  
  return md;
}

/**
 * Generate verification URL
 */
export function generateVerificationUrl(proposal: ChangeProposal): string {
  const encoded = btoa(JSON.stringify(proposal));
  return `/admin/verify-changes?proposal=${encodeURIComponent(encoded)}`;
}
