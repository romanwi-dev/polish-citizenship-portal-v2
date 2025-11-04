import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkflowTransitionRequest {
  jobId: string;
  action: 'start_ai' | 'approve_ai' | 'reject_ai' | 'assign_translator' | 'translator_complete' | 'upload_final' | 'complete';
  data?: {
    translatorId?: string;
    humanTranslation?: string;
    qualityScore?: number;
    reviewNotes?: string;
    finalDocumentId?: string;
    certificationDate?: string;
  };
}

const workflowStages = {
  'pending': { next: 'ai_translating', status: 'ai_translating' },
  'ai_translating': { next: 'ai_complete', status: 'ai_complete' },
  'ai_complete': { next: 'human_review', status: 'human_review' },
  'human_review': { next: 'approved_for_translator', status: 'approved_for_translator' },
  'approved_for_translator': { next: 'assigned_to_translator', status: 'assigned' },
  'assigned_to_translator': { next: 'translator_in_progress', status: 'in_progress' },
  'translator_in_progress': { next: 'translator_complete', status: 'translator_complete' },
  'translator_complete': { next: 'document_uploaded', status: 'document_uploaded' },
  'document_uploaded': { next: 'completed', status: 'completed' },
  'completed': { next: null, status: 'completed' }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { jobId, action, data: actionData }: WorkflowTransitionRequest = await req.json();

    console.log(`[Translation Workflow] Action: ${action} for job: ${jobId}`);

    // Get current job
    const { data: job, error: jobError } = await supabase
      .from('translation_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return new Response(
        JSON.stringify({ error: 'Translation job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let updates: any = {};
    let historyEntry: any = {
      job_id: jobId,
      changed_by: user.id,
      change_type: action
    };

    // Process action
    switch (action) {
      case 'start_ai':
        if (job.workflow_stage !== 'pending') {
          return new Response(
            JSON.stringify({ error: 'Job must be in pending stage to start AI translation' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        updates = {
          workflow_stage: 'ai_translating',
          status: 'ai_translating',
          stage_entered_at: new Date().toISOString()
        };
        historyEntry.new_value = 'AI translation started';
        break;

      case 'approve_ai':
        if (job.workflow_stage !== 'ai_complete' && job.workflow_stage !== 'human_review') {
          return new Response(
            JSON.stringify({ error: 'Job must be in ai_complete or human_review stage' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        updates = {
          workflow_stage: 'approved_for_translator',
          status: 'approved_for_translator',
          human_reviewed_by: user.id,
          human_reviewed_at: new Date().toISOString(),
          human_review_notes: actionData?.reviewNotes,
          quality_score: actionData?.qualityScore,
          stage_entered_at: new Date().toISOString()
        };
        if (actionData?.humanTranslation) {
          updates.human_translation = actionData.humanTranslation;
        }
        historyEntry.new_value = `Approved by HAC with quality score: ${actionData?.qualityScore || 'N/A'}`;
        break;

      case 'reject_ai':
        if (job.workflow_stage !== 'ai_complete' && job.workflow_stage !== 'human_review') {
          return new Response(
            JSON.stringify({ error: 'Job must be in ai_complete or human_review stage' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        updates = {
          workflow_stage: 'human_review',
          status: 'human_review',
          human_reviewed_by: user.id,
          human_reviewed_at: new Date().toISOString(),
          human_review_notes: actionData?.reviewNotes,
          human_translation: actionData?.humanTranslation || job.ai_translation,
          stage_entered_at: new Date().toISOString()
        };
        historyEntry.new_value = 'AI translation rejected, human translation required';
        break;

      case 'assign_translator':
        if (job.workflow_stage !== 'approved_for_translator') {
          return new Response(
            JSON.stringify({ error: 'Job must be approved before assigning translator' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (!actionData?.translatorId) {
          return new Response(
            JSON.stringify({ error: 'Translator ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        updates = {
          workflow_stage: 'assigned_to_translator',
          status: 'assigned',
          assigned_translator_id: actionData.translatorId,
          assigned_at: new Date().toISOString(),
          stage_entered_at: new Date().toISOString()
        };
        historyEntry.new_value = `Assigned to translator: ${actionData.translatorId}`;
        break;

      case 'translator_complete':
        if (job.workflow_stage !== 'translator_in_progress' && job.workflow_stage !== 'assigned_to_translator') {
          return new Response(
            JSON.stringify({ error: 'Invalid workflow stage for completion' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        updates = {
          workflow_stage: 'translator_complete',
          status: 'translator_complete',
          translator_completed_at: new Date().toISOString(),
          translator_notes: actionData?.reviewNotes,
          final_translation: actionData?.humanTranslation || job.human_translation || job.ai_translation,
          stage_entered_at: new Date().toISOString()
        };
        historyEntry.new_value = 'Sworn translator completed translation';
        break;

      case 'upload_final':
        if (job.workflow_stage !== 'translator_complete') {
          return new Response(
            JSON.stringify({ error: 'Translation must be complete before uploading document' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (!actionData?.finalDocumentId) {
          return new Response(
            JSON.stringify({ error: 'Final document ID required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        updates = {
          workflow_stage: 'document_uploaded',
          status: 'document_uploaded',
          final_document_id: actionData.finalDocumentId,
          certification_date: actionData?.certificationDate,
          stage_entered_at: new Date().toISOString()
        };
        historyEntry.new_value = `Final document uploaded: ${actionData.finalDocumentId}`;
        break;

      case 'complete':
        if (job.workflow_stage !== 'document_uploaded') {
          return new Response(
            JSON.stringify({ error: 'Document must be uploaded before completing' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        updates = {
          workflow_stage: 'completed',
          status: 'completed',
          completed_at: new Date().toISOString(),
          stage_entered_at: new Date().toISOString()
        };
        historyEntry.new_value = 'Translation workflow completed';
        
        // Update related task if exists
        if (job.task_id) {
          await supabase
            .from('tasks')
            .update({ status: 'completed', completed_at: new Date().toISOString() })
            .eq('id', job.task_id);
        }
        
        // Update document translation status
        if (job.document_id) {
          await supabase
            .from('documents')
            .update({ 
              is_translated: true, 
              translation_required: false,
              needs_translation: false 
            })
            .eq('id', job.document_id);
        }
        break;

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    // Update job
    const { error: updateError } = await supabase
      .from('translation_jobs')
      .update(updates)
      .eq('id', jobId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    // Create history entry
    await supabase
      .from('translation_job_history')
      .insert(historyEntry);

    console.log(`[Translation Workflow] Successfully transitioned to: ${updates.workflow_stage}`);

    return new Response(
      JSON.stringify({
        success: true,
        workflow_stage: updates.workflow_stage,
        status: updates.status
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation workflow error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Translation workflow processing failed';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
