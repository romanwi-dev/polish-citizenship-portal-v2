// FIX #3: Error Recovery - Schedule automatic OCR retry with exponential backoff
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

    const { documentId, workflowInstanceId, errorPhase, errorMessage } = await req.json();

    if (!documentId || !workflowInstanceId) {
      return new Response(
        JSON.stringify({ error: 'Document ID and workflow instance ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[schedule-ocr-retry] Scheduling retry for document ${documentId}`);

    // Mark workflow for retry using database function
    const { data: retryResult, error: retryError } = await supabaseClient.rpc(
      'mark_workflow_for_retry',
      {
        p_workflow_instance_id: workflowInstanceId,
        p_error_phase: errorPhase || 'ocr',
        p_error_message: errorMessage || 'OCR processing failed',
        p_retry_delay_minutes: 5 // Start with 5 minute delay
      }
    );

    if (retryError) {
      console.error('[schedule-ocr-retry] Failed to mark for retry:', retryError);
      return new Response(
        JSON.stringify({ error: 'Failed to schedule retry', details: retryError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[schedule-ocr-retry] Retry scheduled:`, retryResult);

    // If retry count is below max (3), attempt immediate retry
    if (retryResult.retry_count < 3) {
      console.log(`[schedule-ocr-retry] Attempting retry ${retryResult.retry_count}/3...`);
      
      try {
        // Get current document version
        const { data: doc, error: docError } = await supabaseClient
          .from('documents')
          .select('version')
          .eq('id', documentId)
          .single();

        if (docError || !doc) {
          throw new Error('Document not found');
        }

        // Trigger OCR with backoff
        const { error: ocrError } = await supabaseClient.functions.invoke('ocr-document', {
          body: { 
            documentId, 
            expectedVersion: doc.version,
            isRetry: true,
            retryCount: retryResult.retry_count
          },
        });

        if (ocrError) {
          console.error(`[schedule-ocr-retry] Retry ${retryResult.retry_count} failed:`, ocrError);
          // Next retry will be scheduled automatically by workflow system
        } else {
          console.log(`[schedule-ocr-retry] Retry ${retryResult.retry_count} succeeded`);
          
          // Mark workflow as back in progress
          await supabaseClient
            .from('workflow_instances')
            .update({ 
              status: 'in_progress',
              metadata: retryResult.metadata || {}
            })
            .eq('id', workflowInstanceId);
        }
      } catch (retryErr) {
        console.error('[schedule-ocr-retry] Retry attempt error:', retryErr);
      }
    } else {
      console.log(`[schedule-ocr-retry] Max retries (3) reached - workflow marked as failed`);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        documentId,
        workflowInstanceId,
        retryCount: retryResult.retry_count,
        status: retryResult.status,
        nextRetryAt: retryResult.next_retry_at
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[schedule-ocr-retry] Unexpected error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
