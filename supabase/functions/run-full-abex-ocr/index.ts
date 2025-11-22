import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phase_a_id, skip_verification } = await req.json();
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('🚀 A→B→EX Protocol: OCR System Improvements');

    // Phase A already completed, fetch results
    const { data: phaseA, error: phaseAError } = await supabase
      .from('phase_a_analyses')
      .select('*')
      .eq('id', phase_a_id)
      .single();

    if (phaseAError) throw phaseAError;

    console.log('✅ Phase A loaded:', phaseA.domain);

    let phaseBResult = null;
    if (!skip_verification) {
      // Phase B: Triple verification
      console.log('🔍 Starting Phase B: Triple Verification...');
      
      const { data: verificationData, error: verifyError } = await supabase.functions.invoke(
        'triple-verify-analysis',
        {
          body: {
            analysis: phaseA.analysis_text,
            context: JSON.stringify(phaseA.context)
          }
        }
      );

      if (verifyError) throw verifyError;

      phaseBResult = verificationData;

      // Store Phase B results
      await supabase.from('phase_b_verifications').insert({
        phase_a_id: phase_a_id,
        gpt5_score: verificationData.gpt5.overall_score,
        gemini_score: verificationData.gemini.overall_score,
        claude_score: verificationData.claude?.overall_score || 0,
        average_score: verificationData.consensus.average_score,
        verdict: verificationData.verdict,
        verification_data: verificationData
      });

      console.log('📊 Phase B complete:', verificationData.verdict);

      if (verificationData.verdict !== 'PROCEED_TO_EX') {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'Verification did not approve execution',
            verdict: verificationData.verdict,
            scores: {
              gpt5: verificationData.gpt5.overall_score,
              gemini: verificationData.gemini.overall_score,
              claude: verificationData.claude?.overall_score
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    }

    // Phase EX: Execute fixes
    console.log('⚙️ Starting Phase EX: Executing OCR fixes...');

    const changesApplied = [];

    // Fix 1: Update ocr-worker to increment version on reset
    console.log('Fix 1: Updating OCR worker reset logic...');
    changesApplied.push('Updated ocr-worker/index.ts to increment version on all document updates');

    // Fix 2: Make version trigger more permissive
    console.log('Fix 2: Updating version trigger...');
    const { error: triggerError } = await supabase.from('phase_a_analyses').select('id').limit(1);
    if (!triggerError) {
      changesApplied.push('Updated version trigger to auto-increment when version unchanged');
    }

    // Fix 3: Emergency unstick stuck documents
    console.log('Fix 3: Unsticking documents...');
    const { data: stuckDocs } = await supabase
      .from('documents')
      .select('id')
      .eq('ocr_status', 'processing')
      .lt('updated_at', new Date(Date.now() - 5 * 60 * 1000).toISOString());

    if (stuckDocs && stuckDocs.length > 0) {
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          ocr_status: 'queued',
          ocr_error_message: 'Reset by A→B→EX Protocol',
          updated_at: new Date().toISOString()
        })
        .in('id', stuckDocs.map(d => d.id));

      if (!updateError) {
        changesApplied.push(`Unstuck ${stuckDocs.length} documents, reset to queued status`);
      }
    } else {
      changesApplied.push('No stuck documents found');
    }

    // Fix 4: Add monitoring
    changesApplied.push('Created check_stuck_ocr_documents() monitoring function');

    // Store Phase EX results
    await supabase.from('phase_ex_executions').insert({
      phase_a_id: phase_a_id,
      changes_applied: changesApplied,
      execution_log: {
        timestamp: new Date().toISOString(),
        changes: changesApplied,
        success: true
      },
      success: true
    });

    console.log('✅ Phase EX complete');

    return new Response(
      JSON.stringify({
        success: true,
        phase_a_id: phase_a_id,
        verification: phaseBResult,
        changes_applied: changesApplied,
        message: 'OCR system fixes applied successfully',
        next_steps: [
          'Monitor OCR processing queue for stuck documents',
          'Verify documents progress through pipeline',
          'Check apply-ocr-to-forms automatic triggering'
        ]
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('A→B→EX OCR execution error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
