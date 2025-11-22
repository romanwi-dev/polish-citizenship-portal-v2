import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { 
      phase_a_id,
      phase_b_id,
      phase_ex_id,
      agent_name = 'pdf-generation-agent',
      domain = 'pdf-generation'
    } = await req.json();

    console.log('📚 Storing proven pattern:', { phase_a_id, phase_b_id, phase_ex_id });

    // Fetch Phase A analysis
    const { data: phaseA, error: phaseAError } = await supabaseClient
      .from('phase_a_analyses')
      .select('*')
      .eq('id', phase_a_id)
      .single();

    if (phaseAError) throw new Error(`Phase A not found: ${phaseAError.message}`);

    // Fetch Phase B verification
    const { data: phaseB, error: phaseBError } = await supabaseClient
      .from('phase_b_verifications')
      .select('*')
      .eq('id', phase_b_id)
      .single();

    if (phaseBError) throw new Error(`Phase B not found: ${phaseBError.message}`);

    // Fetch Phase EX execution
    const { data: phaseEX, error: phaseEXError } = await supabaseClient
      .from('phase_ex_executions')
      .select('*')
      .eq('id', phase_ex_id)
      .single();

    if (phaseEXError) throw new Error(`Phase EX not found: ${phaseEXError.message}`);

    // Only store if Phase EX was successful
    if (!phaseEX.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Cannot store pattern from failed execution' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Calculate effectiveness score based on verification scores and execution success
    const effectivenessScore = phaseB.overall_score / 100; // Normalize to 0-1

    // Extract tags from domain and critical issues
    const tags = [
      domain,
      ...phaseA.critical_issues.slice(0, 3), // Top 3 critical issues as tags
      phaseB.consensus,
      'verified',
      'successful'
    ].filter(Boolean);

    // Store proven pattern
    const { data: pattern, error: patternError } = await supabaseClient
      .from('proven_patterns')
      .insert({
        agent_name,
        domain,
        problem_description: phaseA.root_cause || phaseA.proposed_changes.substring(0, 500),
        solution_approach: phaseA.proposed_solution || 'See phase_a_analysis for details',
        phase_a_analysis: phaseA.analysis_result,
        phase_b_verification: {
          passed: phaseB.passed,
          overall_score: phaseB.overall_score,
          confidence: phaseB.confidence,
          consensus: phaseB.consensus,
          models: phaseB.models
        },
        success_metrics: {
          verification_score: phaseB.overall_score,
          execution_duration_ms: phaseEX.execution_duration_ms,
          changes_applied: phaseEX.changes_applied
        },
        effectiveness_score: effectivenessScore,
        tags,
        metadata: {
          phase_a_id,
          phase_b_id,
          phase_ex_id,
          stored_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (patternError) throw new Error(`Failed to store pattern: ${patternError.message}`);

    // Log to AI agent activity
    await supabaseClient
      .from('ai_agent_activity')
      .insert({
        agent_name,
        activity_type: 'pattern_stored',
        description: `Stored proven pattern from successful A→B→EX execution`,
        status: 'completed',
        completed_at: new Date().toISOString(),
        input_data: { phase_a_id, phase_b_id, phase_ex_id },
        output_data: { pattern_id: pattern.id, effectiveness_score: effectivenessScore },
        metadata: { domain, tags }
      });

    console.log('✅ Pattern stored successfully:', pattern.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        pattern_id: pattern.id,
        effectiveness_score: effectivenessScore,
        tags
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error storing pattern:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
