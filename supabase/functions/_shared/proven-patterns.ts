/**
 * Proven Patterns System for Agent Learning
 * Stores successful Phase EX executions for future Phase A reference
 */

export interface ProvenPattern {
  pattern_id: string;
  agent_name: string;
  domain: string;
  problem_description: string;
  solution_approach: string;
  phase_a_analysis: any;
  phase_b_verification: any;
  phase_ex_result: any;
  success_metrics: {
    execution_time_ms: number;
    error_rate: number;
    rollback_needed: boolean;
  };
  usage_count: number;
  effectiveness_score: number;
  tags: string[];
  created_at: string;
}

export class ProvenPatternsLibrary {
  constructor(private supabase: any) {}

  /**
   * Store a successful Phase EX execution as a proven pattern
   */
  async storePattern(params: {
    agent_name: string;
    domain: string;
    problem_description: string;
    solution_approach: string;
    phase_a_analysis: any;
    phase_b_verification: any;
    phase_ex_result: any;
    execution_time_ms: number;
    tags?: string[];
  }): Promise<ProvenPattern> {
    const pattern: ProvenPattern = {
      pattern_id: `pattern_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      agent_name: params.agent_name,
      domain: params.domain,
      problem_description: params.problem_description,
      solution_approach: params.solution_approach,
      phase_a_analysis: params.phase_a_analysis,
      phase_b_verification: params.phase_b_verification,
      phase_ex_result: params.phase_ex_result,
      success_metrics: {
        execution_time_ms: params.execution_time_ms,
        error_rate: 0,
        rollback_needed: false,
      },
      usage_count: 0,
      effectiveness_score: params.phase_b_verification.overall_score || 85,
      tags: params.tags || this.extractTags(params.domain, params.problem_description),
      created_at: new Date().toISOString(),
    };

    // Store in agent_memory as a proven pattern
    await this.supabase.from('agent_memory').insert({
      agent_type: params.agent_name,
      memory_key: `proven_pattern_${pattern.pattern_id}`,
      data: pattern,
    });

    console.log(`[ProvenPatterns] Stored pattern ${pattern.pattern_id} for ${params.agent_name}`);
    
    return pattern;
  }

  /**
   * Search for relevant proven patterns based on current problem
   */
  async findRelevantPatterns(params: {
    agent_name: string;
    domain: string;
    problem_keywords: string[];
    limit?: number;
  }): Promise<ProvenPattern[]> {
    const { data, error } = await this.supabase
      .from('agent_memory')
      .select('data')
      .eq('agent_type', params.agent_name)
      .ilike('memory_key', 'proven_pattern_%')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[ProvenPatterns] Error fetching patterns:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Extract patterns and score relevance
    const patterns: Array<ProvenPattern & { relevance_score: number }> = data
      .map((record: any) => record.data as ProvenPattern)
      .filter((pattern: ProvenPattern) => {
        // Filter by domain if specified
        if (params.domain && pattern.domain !== params.domain) {
          return false;
        }
        return true;
      })
      .map((pattern: ProvenPattern) => {
        // Calculate relevance score based on keyword matching
        const relevanceScore = this.calculateRelevance(
          pattern,
          params.problem_keywords
        );
        return { ...pattern, relevance_score: relevanceScore };
      })
      .filter((pattern: ProvenPattern & { relevance_score: number }) => pattern.relevance_score > 0.3) // Only patterns with >30% relevance
      .sort((a: ProvenPattern & { relevance_score: number }, b: ProvenPattern & { relevance_score: number }) => {
        // Sort by relevance first, then effectiveness
        if (Math.abs(a.relevance_score - b.relevance_score) > 0.1) {
          return b.relevance_score - a.relevance_score;
        }
        return b.effectiveness_score - a.effectiveness_score;
      });

    const limit = params.limit || 5;
    return patterns.slice(0, limit);
  }

  /**
   * Increment usage count for a pattern
   */
  async incrementUsage(pattern_id: string, agent_name: string): Promise<void> {
    const { data, error } = await this.supabase
      .from('agent_memory')
      .select('data')
      .eq('agent_type', agent_name)
      .eq('memory_key', `proven_pattern_${pattern_id}`)
      .single();

    if (error || !data) {
      console.error('[ProvenPatterns] Pattern not found:', pattern_id);
      return;
    }

    const pattern = data.data as ProvenPattern;
    pattern.usage_count += 1;

    await this.supabase
      .from('agent_memory')
      .update({ data: pattern })
      .eq('agent_type', agent_name)
      .eq('memory_key', `proven_pattern_${pattern_id}`);
  }

  /**
   * Update pattern effectiveness based on outcome
   */
  async updateEffectiveness(
    pattern_id: string,
    agent_name: string,
    success: boolean,
    execution_time_ms: number
  ): Promise<void> {
    const { data, error } = await this.supabase
      .from('agent_memory')
      .select('data')
      .eq('agent_type', agent_name)
      .eq('memory_key', `proven_pattern_${pattern_id}`)
      .single();

    if (error || !data) {
      return;
    }

    const pattern = data.data as ProvenPattern;
    
    // Update effectiveness score (exponential moving average)
    const weight = 0.3; // Weight for new observation
    const outcomeScore = success ? 100 : 0;
    pattern.effectiveness_score = 
      pattern.effectiveness_score * (1 - weight) + outcomeScore * weight;

    // Update success metrics
    if (!success) {
      const totalUsages = pattern.usage_count || 1;
      const currentErrors = pattern.success_metrics.error_rate * totalUsages;
      pattern.success_metrics.error_rate = (currentErrors + 1) / (totalUsages + 1);
    }

    // Update average execution time
    const totalUsages = pattern.usage_count || 1;
    const currentAvgTime = pattern.success_metrics.execution_time_ms;
    pattern.success_metrics.execution_time_ms = 
      (currentAvgTime * totalUsages + execution_time_ms) / (totalUsages + 1);

    await this.supabase
      .from('agent_memory')
      .update({ data: pattern })
      .eq('agent_type', agent_name)
      .eq('memory_key', `proven_pattern_${pattern_id}`);
  }

  /**
   * Generate enhanced Phase A analysis with proven patterns
   */
  generateEnhancedAnalysis(
    baseAnalysis: string,
    relevantPatterns: ProvenPattern[]
  ): string {
    if (relevantPatterns.length === 0) {
      return baseAnalysis;
    }

    const patternsSection = `

## PROVEN PATTERNS REFERENCE
Found ${relevantPatterns.length} relevant proven pattern(s) from past successes:

${relevantPatterns.map((pattern, idx) => `
### Pattern ${idx + 1}: ${pattern.pattern_id}
- **Domain**: ${pattern.domain}
- **Problem**: ${pattern.problem_description}
- **Solution**: ${pattern.solution_approach}
- **Effectiveness**: ${pattern.effectiveness_score.toFixed(1)}% (used ${pattern.usage_count} times)
- **Avg Execution**: ${pattern.success_metrics.execution_time_ms}ms
- **Error Rate**: ${(pattern.success_metrics.error_rate * 100).toFixed(1)}%
- **Tags**: ${pattern.tags.join(', ')}

**Key Insights from Pattern:**
${this.extractKeyInsights(pattern)}
`).join('\n')}

## RECOMMENDED APPROACH BASED ON PATTERNS
${this.synthesizeRecommendations(relevantPatterns)}
`;

    return baseAnalysis + patternsSection;
  }

  private calculateRelevance(
    pattern: ProvenPattern,
    keywords: string[]
  ): number {
    const patternText = `
      ${pattern.problem_description} 
      ${pattern.solution_approach} 
      ${pattern.tags.join(' ')}
    `.toLowerCase();

    let matchCount = 0;
    for (const keyword of keywords) {
      if (patternText.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    return keywords.length > 0 ? matchCount / keywords.length : 0;
  }

  private extractTags(domain: string, description: string): string[] {
    const commonTags = [
      'database', 'api', 'validation', 'security', 'performance',
      'workflow', 'ocr', 'pdf', 'dropbox', 'translation', 'forms',
    ];

    const text = `${domain} ${description}`.toLowerCase();
    return commonTags.filter(tag => text.includes(tag));
  }

  private extractKeyInsights(pattern: ProvenPattern): string {
    const insights: string[] = [];

    if (pattern.success_metrics.execution_time_ms < 1000) {
      insights.push('- Fast execution (< 1 second)');
    }

    if (pattern.success_metrics.error_rate === 0) {
      insights.push('- Zero error rate');
    }

    if (pattern.usage_count > 10) {
      insights.push(`- Highly reused (${pattern.usage_count} times)`);
    }

    if (pattern.effectiveness_score > 90) {
      insights.push('- Exceptionally high effectiveness');
    }

    // Extract from Phase B verification
    if (pattern.phase_b_verification?.consensus === 'strong') {
      insights.push('- Strong AI consensus achieved');
    }

    return insights.length > 0 
      ? insights.join('\n')
      : '- Reliable pattern with proven track record';
  }

  private synthesizeRecommendations(patterns: ProvenPattern[]): string {
    const topPattern = patterns[0];
    
    return `
Based on the most relevant proven pattern (${topPattern.pattern_id}):

1. **Adopt similar approach**: ${topPattern.solution_approach}
2. **Expected performance**: ~${topPattern.success_metrics.execution_time_ms}ms execution
3. **Risk level**: ${topPattern.success_metrics.error_rate === 0 ? 'Very Low' : 'Low-Medium'}
4. **Confidence**: ${topPattern.effectiveness_score.toFixed(1)}% based on ${topPattern.usage_count} previous uses

Consider combining insights from multiple patterns for optimal results.
`;
  }

  /**
   * Cleanup old or ineffective patterns
   */
  async cleanupPatterns(agent_name: string): Promise<number> {
    const { data, error } = await this.supabase
      .from('agent_memory')
      .select('data, id')
      .eq('agent_type', agent_name)
      .ilike('memory_key', 'proven_pattern_%');

    if (error || !data) {
      return 0;
    }

    const patternsToDelete: number[] = [];

    for (const record of data) {
      const pattern = record.data as ProvenPattern;
      
      // Delete patterns with low effectiveness and usage
      if (pattern.effectiveness_score < 50 && pattern.usage_count < 3) {
        patternsToDelete.push(record.id);
      }
      
      // Delete very old patterns (>6 months) with no usage
      const age = Date.now() - new Date(pattern.created_at).getTime();
      const sixMonths = 6 * 30 * 24 * 60 * 60 * 1000;
      if (age > sixMonths && pattern.usage_count === 0) {
        patternsToDelete.push(record.id);
      }
    }

    if (patternsToDelete.length > 0) {
      await this.supabase
        .from('agent_memory')
        .delete()
        .in('id', patternsToDelete);

      console.log(`[ProvenPatterns] Cleaned up ${patternsToDelete.length} ineffective patterns`);
    }

    return patternsToDelete.length;
  }
}

/**
 * Create a ProvenPatternsLibrary instance
 */
export function createProvenPatternsLibrary(supabase: any): ProvenPatternsLibrary {
  return new ProvenPatternsLibrary(supabase);
}
