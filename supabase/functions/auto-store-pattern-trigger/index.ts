import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { getErrorMessage } from "../_shared/error-utils.ts";

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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Service role for trigger
    );

    const body = await req.json();
    const record = body.record || body;
    
    console.log('🎯 Auto-store pattern trigger fired for Phase EX:', record.id);

    // Only process successful executions
    if (!record.success) {
      console.log('⏭️ Skipping - execution was not successful');
      return new Response(
        JSON.stringify({ skipped: true, reason: 'not_successful' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if pattern already stored
    const { data: existing } = await supabaseClient
      .from('proven_patterns')
      .select('id')
      .eq('metadata->>phase_ex_id', record.id)
      .maybeSingle();

    if (existing) {
      console.log('⏭️ Pattern already stored for this execution');
      return new Response(
        JSON.stringify({ skipped: true, reason: 'already_stored' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch Phase A
    const { data: phaseA, error: phaseAError } = await supabaseClient
      .from('phase_a_analyses')
      .select('*')
      .eq('id', record.phase_a_id)
      .single();

    if (phaseAError) {
      console.error('❌ Phase A not found:', phaseAError);
      return new Response(
        JSON.stringify({ error: 'Phase A not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch Phase B
    const { data: phaseB, error: phaseBError } = await supabaseClient
      .from('phase_b_verifications')
      .select('*')
      .eq('id', record.phase_b_id)
      .single();

    if (phaseBError) {
      console.error('❌ Phase B not found:', phaseBError);
      return new Response(
        JSON.stringify({ error: 'Phase B not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Only store high-quality patterns (score >= 80)
    if (phaseB.overall_score < 80) {
      console.log('⏭️ Skipping - verification score too low:', phaseB.overall_score);
      return new Response(
        JSON.stringify({ skipped: true, reason: 'low_score', score: phaseB.overall_score }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const effectivenessScore = phaseB.overall_score / 100;
    const tags = [
      phaseA.domain,
      ...phaseA.critical_issues.slice(0, 3),
      phaseB.consensus,
      'auto-stored',
      'verified',
      'successful'
    ].filter(Boolean);

    // Store the pattern
    const { data: pattern, error: patternError } = await supabaseClient
      .from('proven_patterns')
      .insert({
        agent_name: phaseA.agent_name,
        domain: phaseA.domain,
        problem_description: phaseA.root_cause || phaseA.proposed_changes.substring(0, 500),
        solution_approach: phaseA.proposed_solution || 'See phase_a_analysis for details',
        phase_a_analysis: phaseA.analysis_result,
        phase_b_verification: {
          passed: phaseB.passed,
          overall_score: phaseB.overall_score,
          confidence: phaseB.confidence,
          consensus: phaseB.consensus
        },
        success_metrics: {
          verification_score: phaseB.overall_score,
          execution_duration_ms: record.execution_duration_ms,
          changes_applied: record.changes_applied
        },
        effectiveness_score: effectivenessScore,
        tags,
        metadata: {
          phase_a_id: record.phase_a_id,
          phase_b_id: record.phase_b_id,
          phase_ex_id: record.id,
          auto_stored: true,
          stored_at: new Date().toISOString()
        }
      })
      .select()
      .single();

    if (patternError) throw patternError;

    // Log activity
    await supabaseClient
      .from('ai_agent_activity')
      .insert({
        agent_name: phaseA.agent_name,
        activity_type: 'pattern_auto_stored',
        description: `Auto-stored proven pattern from successful A→B→EX execution`,
        status: 'completed',
        completed_at: new Date().toISOString(),
        output_data: { pattern_id: pattern.id, effectiveness_score: effectivenessScore },
        metadata: { domain: phaseA.domain, tags, trigger: 'automatic' }
      });

    console.log('✅ Pattern auto-stored successfully:', pattern.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        pattern_id: pattern.id,
        effectiveness_score: effectivenessScore,
        auto_stored: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Auto-store pattern error:', error);
    return new Response(
      JSON.stringify({ error: getErrorMessage(error) }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
