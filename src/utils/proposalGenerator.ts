/**
 * Proposal Generator Utilities
 * Helper functions to generate ChangeProposal objects for AI verification
 */

import { ChangeProposal, FileChange } from "./verificationWorkflow";

/**
 * Classify change type based on files affected
 */
export function classifyChangeType(files: FileChange[]): ChangeProposal['type'] {
  const hasMigration = files.some(f => f.path.includes('supabase/migrations'));
  const hasEdgeFunction = files.some(f => f.path.includes('supabase/functions'));
  const hasFrontend = files.some(f => f.path.includes('src/'));

  if (hasMigration && hasEdgeFunction && hasFrontend) return 'mixed';
  if (hasMigration && hasFrontend) return 'mixed';
  if (hasEdgeFunction && hasFrontend) return 'mixed';
  if (hasMigration && hasEdgeFunction) return 'mixed';
  
  if (hasMigration) return 'database';
  if (hasEdgeFunction) return 'edge_function';
  if (hasFrontend) return 'frontend';
  
  return 'mixed';
}

/**
 * Determine if verification should be skipped for trivial changes
 */
export function shouldSkipVerification(proposal: ChangeProposal): boolean {
  // Skip for pure CSS/styling changes
  const isPureStyling = proposal.files.every(f => 
    f.changes.toLowerCase().includes('css') || 
    f.changes.toLowerCase().includes('styling') ||
    f.changes.toLowerCase().includes('color') ||
    f.changes.toLowerCase().includes('spacing')
  );

  // Skip for typo fixes
  const isTypoFix = proposal.description.toLowerCase().includes('typo') ||
                    proposal.description.toLowerCase().includes('fix text');

  // Skip for documentation updates
  const isDocUpdate = proposal.files.every(f => 
    f.path.endsWith('.md') || 
    f.path.includes('README')
  );

  return isPureStyling || isTypoFix || isDocUpdate;
}

/**
 * Generate a database migration proposal
 */
export function createDatabaseProposal(
  description: string,
  sqlStatements: string[],
  impact: string,
  risks: string[] = [],
  rollbackPlan: string = "Revert migration using Supabase migration rollback"
): ChangeProposal {
  return {
    type: 'database',
    description,
    impact,
    files: [{
      path: `supabase/migrations/${Date.now()}_${description.toLowerCase().replace(/\s+/g, '_')}.sql`,
      action: 'create',
      changes: 'Database migration with schema changes',
      linesAffected: `1-${sqlStatements.length}`
    }],
    sql: sqlStatements,
    reasoning: `Database schema changes to support: ${description}`,
    risks: risks.length > 0 ? risks : ['Data migration may affect existing records', 'Downtime during migration'],
    rollbackPlan
  };
}

/**
 * Generate an edge function proposal
 */
export function createEdgeFunctionProposal(
  functionName: string,
  description: string,
  changes: string,
  impact: string,
  risks: string[] = []
): ChangeProposal {
  return {
    type: 'edge_function',
    description,
    impact,
    files: [{
      path: `supabase/functions/${functionName}/index.ts`,
      action: 'edit',
      changes,
      linesAffected: 'TBD'
    }],
    edgeFunctions: [{ name: functionName, changes }],
    reasoning: `Edge function changes to support: ${description}`,
    risks: risks.length > 0 ? risks : ['API changes may affect client calls', 'Edge function deployment may have downtime'],
    rollbackPlan: 'Revert to previous edge function version via Supabase dashboard'
  };
}

/**
 * Generate a frontend component proposal
 */
export function createFrontendProposal(
  files: FileChange[],
  description: string,
  impact: string,
  risks: string[] = []
): ChangeProposal {
  return {
    type: 'frontend',
    description,
    impact,
    files,
    reasoning: `Frontend changes to support: ${description}`,
    risks: risks.length > 0 ? risks : ['UI changes may affect user experience', 'Breaking changes for existing workflows'],
    rollbackPlan: 'Revert Git commit to restore previous version'
  };
}

/**
 * Generate a mixed (multi-layer) proposal
 */
export function createMixedProposal(
  files: FileChange[],
  description: string,
  impact: string,
  sql?: string[],
  edgeFunctions?: Array<{ name: string; changes: string }>,
  risks: string[] = []
): ChangeProposal {
  return {
    type: 'mixed',
    description,
    impact,
    files,
    sql,
    edgeFunctions,
    reasoning: `Multi-layer changes to support: ${description}`,
    risks: risks.length > 0 ? risks : [
      'Database and frontend changes must be deployed in sync',
      'Rollback requires coordinating multiple layers'
    ],
    rollbackPlan: 'Revert all layers: database migration, edge functions, and frontend code'
  };
}

/**
 * Generate common risk assessments based on change type
 */
export function generateRiskAssessment(type: ChangeProposal['type']): string[] {
  const risks: Record<ChangeProposal['type'], string[]> = {
    database: [
      'Data migration may affect existing records',
      'Schema changes could break existing queries',
      'RLS policies may need adjustment',
      'Potential for data loss if not handled carefully'
    ],
    edge_function: [
      'API changes may break client integrations',
      'Edge function deployment may have brief downtime',
      'Rate limiting may be affected',
      'Error handling changes could mask issues'
    ],
    frontend: [
      'UI changes may affect user workflows',
      'Breaking changes for existing features',
      'Performance impact on page load',
      'Accessibility may be affected'
    ],
    mixed: [
      'Multiple layers must be deployed in sync',
      'Rollback coordination required across layers',
      'Increased complexity for debugging',
      'Higher risk of incomplete deployment'
    ]
  };

  return risks[type] || [];
}

/**
 * Template for creating a complete proposal from scratch
 */
export function createProposalFromScratch(
  description: string,
  files: FileChange[],
  impact: string,
  sql?: string[],
  edgeFunctions?: Array<{ name: string; changes: string }>,
  customRisks?: string[],
  customRollback?: string
): ChangeProposal {
  const type = classifyChangeType(files);
  const defaultRisks = customRisks || generateRiskAssessment(type);
  const defaultRollback = customRollback || 'Revert Git commit and database migrations as needed';

  return {
    type,
    description,
    impact,
    files,
    sql,
    edgeFunctions,
    reasoning: `Changes to implement: ${description}`,
    risks: defaultRisks,
    rollbackPlan: defaultRollback
  };
}
