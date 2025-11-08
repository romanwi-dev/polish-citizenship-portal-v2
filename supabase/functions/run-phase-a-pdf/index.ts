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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('🚀 PHASE A: Deep PDF System Analysis Started');

    // CRITICAL ISSUES IDENTIFIED
    const criticalIssues = [
      'TABLE_MISMATCH: Frontend polls pdf_queue, backend writes to pdf_generation_queue',
      'PREVIEW_BROKEN: pdf-preview has zero logs, not being called or failing silently',
      'WORKER_NEVER_RUNS: No pg_cron job or manual invocation for pdf-worker',
      'NEW_TEMPLATE_UNMAPPED: new-TRANSCRIPTION.pdf has no field mappings',
      'QUEUE_INCOMPLETE: pdf_generation_queue missing metadata column',
      'DATA_FLOW_GAPS: master_table → form tables → PDF mappings incomplete',
      'EDIT_AFTER_DOWNLOAD: No clear workflow for editing downloaded PDFs',
      'FLATTEN_INCONSISTENCY: Some calls flatten=true, others false, unclear strategy'
    ];

    const rootCause = `
ARCHITECTURAL FRAGMENTATION: PDF generation system built incrementally without unified design.
- Dual queue tables created but never unified
- Worker function exists but no scheduler configured  
- Preview function exists but not integrated into flow
- New templates added without updating mappings
- Frontend/backend use different table names
- No single source of truth for field→PDF mappings
    `;

    const proposedSolution = `
UNIFIED PDF GENERATION ARCHITECTURE:

PHASE 1: INFRASTRUCTURE FIX
1. Unify Queue Tables - Drop pdf_queue, add metadata to pdf_generation_queue
2. Enable Worker - Create pg_cron OR make synchronous
3. Fix Preview - Update PDFPreviewDialog to call pdf-preview correctly

PHASE 2: TEMPLATE MAPPINGS
4. new-TRANSCRIPTION Field Mappings (3 pages)
5. Complete All Form Mappings (8 templates total)

PHASE 3: EDIT WORKFLOWS
6. Preview Editing - regenerate on save
7. Post-Download Editing - OCR roundtrip

PHASE 4: DATA FLOW
8. Master Table Integration - single source of truth

PHASE 5: AGENT LEARNING
9. Store Proven Patterns

PHASE 6: TESTING
10. End-to-End Tests for all templates
    `;

    // Store Phase A
    const { data: phaseA, error: phaseAError } = await supabaseClient
      .from('phase_a_analyses')
      .insert({
        agent_name: 'pdf-generation-master-agent',
        domain: 'pdf-generation-all-forms',
        proposed_changes: 'Complete PDF generation system overhaul for 8 templates',
        context: {
          templates: ['POA-Adult', 'POA-Minor', 'POA-Spouses', 'citizenship', 'family-tree', 'new-TRANSCRIPTION', 'umiejscowienie', 'uzupelnienie'],
          current_issues: criticalIssues,
          requirements: ['Preview works', 'Generation works', 'Editing works']
        },
        analysis_result: {
          criticalIssues,
          rootCause,
          proposedSolution,
          timestamp: new Date().toISOString()
        },
        total_issues: criticalIssues.length,
        critical_issues: criticalIssues,
        warnings: [],
        root_cause: rootCause,
        proposed_solution: proposedSolution
      })
      .select()
      .single();

    if (phaseAError) throw new Error(`Phase A storage failed: ${phaseAError.message}`);

    console.log('✅ Phase A complete:', phaseA.id);

    return new Response(
      JSON.stringify({
        success: true,
        phase: 'A',
        phase_a_id: phaseA.id,
        summary: {
          totalIssues: criticalIssues.length,
          criticalIssues,
          rootCause,
          proposedSolution,
          readyForPhaseB: true
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Phase A failed:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
