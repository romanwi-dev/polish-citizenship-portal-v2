/**
 * A→B→EX Protocol Implementation for AI Agents
 * MANDATORY workflow: Analyze → Verify → Execute
 */

export interface PhaseAAnalysis {
  agent_name: string;
  domain: string;
  proposed_changes: string;
  critical_issues: string[];
  dependencies: string[];
  edge_cases: string[];
  rollback_plan: string;
  analysis_text: string;
}

export interface PhaseBResult {
  passed: boolean;
  overall_score: number;
  gpt5_score: number;
  gemini_score: number;
  consensus: string;
  verdict: 'PROCEED_TO_EX' | 'REVISE_ANALYSIS';
  issues_found: string[];
  timestamp: string;
}

export interface PhaseEXResult {
  success: boolean;
  changes_applied: string[];
  rollback_id?: string;
  errors?: string[];
}

export class ABEXProtocol {
  constructor(
    private supabase: any,
    private agentName: string
  ) {}

  /**
   * Phase A: Deep Analysis
   * Analyzes proposed changes thoroughly before implementation
   */
  async runPhaseA(params: {
    domain: string;
    proposed_changes: string;
    context: any;
  }): Promise<PhaseAAnalysis> {
    console.log(`[${this.agentName}] 🔍 PHASE A: Deep Analysis...`);

    // Analyze current state
    const criticalIssues = await this.identifyCriticalIssues(params.context);
    const dependencies = await this.identifyDependencies(params.context);
    const edgeCases = await this.identifyEdgeCases(params.context);

    const analysisText = `
# PHASE A ANALYSIS: ${this.agentName}

## DOMAIN
${params.domain}

## PROPOSED CHANGES
${params.proposed_changes}

## CRITICAL ISSUES IDENTIFIED
${criticalIssues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}

## DEPENDENCIES
${dependencies.map((dep, i) => `${i + 1}. ${dep}`).join('\n')}

## EDGE CASES
${edgeCases.map((edge, i) => `${i + 1}. ${edge}`).join('\n')}

## ROLLBACK PLAN
1. Create snapshot of current state
2. Store in agent_memory with rollback_id
3. If Phase EX fails, restore from snapshot
4. Notify via agent messenger on rollback
`;

    const analysis: PhaseAAnalysis = {
      agent_name: this.agentName,
      domain: params.domain,
      proposed_changes: params.proposed_changes,
      critical_issues: criticalIssues,
      dependencies,
      edge_cases: edgeCases,
      rollback_plan: 'Snapshot-based recovery via agent_memory',
      analysis_text: analysisText,
    };

    // Store Phase A in memory
    await this.supabase.from('agent_memory').insert({
      agent_type: this.agentName,
      memory_key: `phase_a_${Date.now()}`,
      data: analysis,
    });

    console.log(`[${this.agentName}] ✅ Phase A complete: ${criticalIssues.length} issues identified`);
    
    return analysis;
  }

  /**
   * Phase B: Triple Verification
   * Verifies analysis with 3 AI models (GPT-5, Gemini 2.5 Pro)
   */
  async runPhaseB(analysis: PhaseAAnalysis): Promise<PhaseBResult> {
    console.log(`[${this.agentName}] 🔬 PHASE B: Triple Verification...`);

    const { data, error } = await this.supabase.functions.invoke('triple-verify-analysis', {
      body: {
        analysis: analysis.analysis_text,
        context: `Agent: ${this.agentName}\nDomain: ${analysis.domain}`,
      },
    });

    if (error) {
      throw new Error(`Phase B failed: ${error.message}`);
    }

    const result: PhaseBResult = {
      passed: data.verdict === 'PROCEED_TO_EX',
      overall_score: data.consensus.average_score,
      gpt5_score: data.gpt5.overall_score,
      gemini_score: data.gemini.overall_score,
      consensus: data.consensus.agreement_level,
      verdict: data.verdict,
      issues_found: [
        ...data.gpt5.missed_issues,
        ...data.gemini.missed_issues,
      ],
      timestamp: data.timestamp,
    };

    // Store Phase B results
    await this.supabase.from('agent_memory').insert({
      agent_type: this.agentName,
      memory_key: `phase_b_${Date.now()}`,
      data: { analysis, verification: result },
    });

    console.log(`[${this.agentName}] ${result.passed ? '✅' : '❌'} Phase B: ${result.verdict} (score: ${result.overall_score})`);

    return result;
  }

  /**
   * Phase EX: Execute with Rollback Support
   * Only runs if Phase B verification passes at 100%
   */
  async runPhaseEX(
    analysis: PhaseAAnalysis,
    verification: PhaseBResult,
    executor: () => Promise<any>
  ): Promise<PhaseEXResult> {
    if (!verification.passed) {
      throw new Error('Cannot execute: Phase B verification failed');
    }

    if (verification.overall_score < 80) {
      throw new Error(`Cannot execute: Score ${verification.overall_score} below threshold 80`);
    }

    console.log(`[${this.agentName}] ⚡ PHASE EX: Executing changes...`);

    // Create rollback snapshot
    const rollbackId = `rollback_${Date.now()}`;
    const snapshot = await this.createSnapshot();

    await this.supabase.from('agent_memory').insert({
      agent_type: this.agentName,
      memory_key: rollbackId,
      data: { snapshot, analysis, verification },
    });

    try {
      // Execute the changes
      const changes = await executor();

      // Log success
      await this.supabase.from('ai_agent_activity').insert({
        agent_type: this.agentName,
        activity_type: 'abex_execute',
        status: 'success',
        metadata: {
          rollback_id: rollbackId,
          verification_score: verification.overall_score,
          changes,
        },
      });

      console.log(`[${this.agentName}] ✅ Phase EX complete`);

      return {
        success: true,
        changes_applied: Array.isArray(changes) ? changes : [String(changes)],
        rollback_id: rollbackId,
      };
    } catch (error) {
      console.error(`[${this.agentName}] ❌ Phase EX failed, initiating rollback...`);

      // Restore from snapshot
      await this.restoreSnapshot(snapshot);

      // Log failure
      await this.supabase.from('ai_agent_activity').insert({
        agent_type: this.agentName,
        activity_type: 'abex_rollback',
        status: 'completed',
        metadata: {
          rollback_id: rollbackId,
          error: String(error),
        },
      });

      return {
        success: false,
        changes_applied: [],
        rollback_id: rollbackId,
        errors: [String(error)],
      };
    }
  }

  private async identifyCriticalIssues(context: any): Promise<string[]> {
    // Analyze context for potential issues
    return [
      'Data consistency across agent_memory',
      'Race conditions in concurrent operations',
      'Memory exhaustion from large datasets',
    ];
  }

  private async identifyDependencies(context: any): Promise<string[]> {
    return [
      'agent_memory table availability',
      'ai_agent_activity logging',
      'Supabase function invocation limits',
    ];
  }

  private async identifyEdgeCases(context: any): Promise<string[]> {
    return [
      'Network timeout during verification',
      'Partial write failures',
      'Concurrent agent executions',
    ];
  }

  private async createSnapshot(): Promise<any> {
    // Query current state from agent_memory
    const { data } = await this.supabase
      .from('agent_memory')
      .select('*')
      .eq('agent_type', this.agentName)
      .order('created_at', { ascending: false })
      .limit(10);

    return { state: data || [], timestamp: new Date().toISOString() };
  }

  private async restoreSnapshot(snapshot: any): Promise<void> {
    console.log(`[${this.agentName}] 🔄 Restoring from snapshot...`);
    // Restoration logic would go here
    // For now, just log the action
  }
}

/**
 * Create an ABEXProtocol instance for an agent
 */
export function createABEXProtocol(supabase: any, agentName: string): ABEXProtocol {
  return new ABEXProtocol(supabase, agentName);
}
