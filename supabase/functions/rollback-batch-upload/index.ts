// FIX #4: Batch Atomicity - Rollback partial batch uploads
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

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

    const { batchId } = await req.json();

    if (!batchId) {
      return new Response(
        JSON.stringify({ error: 'Batch ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[rollback-batch-upload] Rolling back batch ${batchId}`);

    // Get batch details
    const { data: batch, error: batchError } = await supabaseClient
      .from('document_batch_uploads')
      .select('*')
      .eq('batch_id', batchId)
      .single();

    if (batchError || !batch) {
      console.error('[rollback-batch-upload] Batch not found:', batchError);
      return new Response(
        JSON.stringify({ error: 'Batch not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const documentIds = batch.document_ids || [];
    console.log(`[rollback-batch-upload] Rolling back ${documentIds.length} documents`);

    // Rollback operations
    const rollbackResults = {
      documentsDeleted: 0,
      workflowsDeleted: 0,
      errors: [] as string[]
    };

    for (const docId of documentIds) {
      try {
        // Delete workflow instances
        const { error: workflowError } = await supabaseClient
          .from('workflow_instances')
          .delete()
          .eq('source_id', docId)
          .eq('source_table', 'documents');

        if (workflowError) {
          console.error(`[rollback-batch-upload] Failed to delete workflow for doc ${docId}:`, workflowError);
          rollbackResults.errors.push(`Workflow deletion failed for ${docId}: ${workflowError.message}`);
        } else {
          rollbackResults.workflowsDeleted++;
        }

        // Soft delete document (set deleted_at timestamp)
        const { error: docError } = await supabaseClient
          .from('documents')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', docId);

        if (docError) {
          console.error(`[rollback-batch-upload] Failed to delete document ${docId}:`, docError);
          rollbackResults.errors.push(`Document deletion failed for ${docId}: ${docError.message}`);
        } else {
          rollbackResults.documentsDeleted++;
        }

        // Note: Dropbox files are NOT deleted - they remain as backup
        // This prevents data loss in case of accidental rollback

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[rollback-batch-upload] Error rolling back document ${docId}:`, error);
        rollbackResults.errors.push(`Rollback error for ${docId}: ${errorMsg}`);
      }
    }

    // Update batch status
    await supabaseClient
      .from('document_batch_uploads')
      .update({ 
        status: 'rolled_back',
        completed_at: new Date().toISOString()
      })
      .eq('batch_id', batchId);

    // Log rollback to HAC logs
    await supabaseClient
      .from('hac_logs')
      .insert({
        case_id: batch.case_id,
        action_type: 'batch_rollback',
        action_description: `Batch upload ${batchId} rolled back`,
        field_changed: 'batch_status',
        old_value: batch.status,
        new_value: 'rolled_back'
      });

    console.log(`[rollback-batch-upload] Rollback complete:`, rollbackResults);

    return new Response(
      JSON.stringify({ 
        success: true,
        batchId,
        rollbackResults,
        message: `Rolled back ${rollbackResults.documentsDeleted} documents and ${rollbackResults.workflowsDeleted} workflows`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[rollback-batch-upload] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
