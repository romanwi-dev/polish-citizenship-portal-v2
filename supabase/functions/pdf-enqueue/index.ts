/**
 * Ultra-lightweight PDF enqueue function
 * Returns immediately (<1 second) after inserting job into queue
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { caseId, templateType, filename } = await req.json();

    if (!caseId || !templateType) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Missing caseId or templateType' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Insert job into queue (fast operation, returns immediately)
    const { data: job, error } = await supabase
      .from('pdf_queue')
      .insert({
        case_id: caseId,
        template_type: templateType,
        metadata: { filename: filename || `${templateType}.pdf` }
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to enqueue PDF job:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        jobId: job.id,
        status: 'queued',
        message: 'PDF generation job queued successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('PDF enqueue error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
