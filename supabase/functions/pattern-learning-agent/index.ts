/**
 * Pattern Learning Agent
 * Periodically reviews and optimizes the proven patterns library
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { createProvenPatternsLibrary } from '../_shared/proven-patterns.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('[pattern-learning-agent] Starting pattern optimization...');

    const patternsLibrary = createProvenPatternsLibrary(supabase);

    // List of all agents with patterns
    const agents = [
      'edge-function-agent',
      'project-memory-agent',
      'pdf-generation-agent',
      'subagent-supervisor',
      'workflow-memory-agent',
      'uiux-memory-agent',
      'dropbox-memory-agent',
      'forms-memory-agent',
      'ai-documents-memory-agent',
      'agent-health-monitor',
      'agent-message-broker',
    ];

    const cleanupResults: Record<string, number> = {};
    const patternStats: Record<string, any> = {};

    for (const agent of agents) {
      // Cleanup ineffective patterns
      const cleaned = await patternsLibrary.cleanupPatterns(agent);
      cleanupResults[agent] = cleaned;

      // Get pattern statistics
      const patterns = await patternsLibrary.findRelevantPatterns({
        agent_name: agent,
        domain: '',
        problem_keywords: [],
        limit: 1000,
      });

      patternStats[agent] = {
        total_patterns: patterns.length,
        avg_effectiveness: patterns.length > 0
          ? patterns.reduce((sum, p) => sum + p.effectiveness_score, 0) / patterns.length
          : 0,
        total_usage: patterns.reduce((sum, p) => sum + p.usage_count, 0),
        most_used: patterns.sort((a, b) => b.usage_count - a.usage_count)[0]?.pattern_id || 'none',
      };
    }

    const report = {
      timestamp: new Date().toISOString(),
      cleanup_summary: cleanupResults,
      pattern_statistics: patternStats,
      total_patterns_cleaned: Object.values(cleanupResults).reduce((sum, n) => sum + n, 0),
      total_active_patterns: Object.values(patternStats).reduce(
        (sum, stats) => sum + stats.total_patterns,
        0
      ),
    };

    // Store report in agent_memory
    await supabase.from('agent_memory').insert({
      agent_type: 'pattern-learning-agent',
      memory_key: `optimization_report_${Date.now()}`,
      data: report,
    });

    // Log activity
    await supabase.from('ai_agent_activity').insert({
      agent_type: 'pattern-learning-agent',
      activity_type: 'pattern_optimization',
      status: 'success',
      metadata: {
        patterns_cleaned: report.total_patterns_cleaned,
        active_patterns: report.total_active_patterns,
      },
    });

    console.log(`[pattern-learning-agent] ✅ Optimized patterns: ${report.total_patterns_cleaned} cleaned`);

    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[pattern-learning-agent] Error:', error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
