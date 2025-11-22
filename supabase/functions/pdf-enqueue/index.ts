/**
 * Ultra-lightweight PDF enqueue function
 * Returns immediately (<1 second) after inserting job into queue
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { getErrorMessage } from '../_shared/error-utils.ts';

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

    // Validate required fields
    if (!caseId || !templateType) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'MISSING_REQUIRED_FIELDS',
          message: 'Missing caseId or templateType' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate template type
    const validTemplates = [
      'poa-adult', 'poa-minor', 'poa-spouses', 
      'family-tree', 'citizenship', 
      'transcription', 'registration'
    ];
    
    if (!validTemplates.includes(templateType)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'INVALID_TEMPLATE',
          message: `Invalid template type. Must be one of: ${validTemplates.join(', ')}`,
          validTemplates 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Rate limiting: max 10 PDFs per case per hour
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    
    const { data: recentJobs, error: rateLimitError } = await supabase
      .from('pdf_generation_queue')
      .select('id')
      .eq('case_id', caseId)
      .gte('created_at', oneHourAgo);

    if (rateLimitError) {
      console.error('Rate limit check failed:', rateLimitError);
      // Continue anyway - don't block on rate limit check failure
    } else if (recentJobs && recentJobs.length >= 10) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many PDF requests. Maximum 10 PDFs per hour per case.',
          limit: 10,
          current: recentJobs.length,
          retryAfter: 3600
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': '3600'
          } 
        }
      );
    }

    // Insert job into queue (fast operation, returns immediately)
    const { data: job, error } = await supabase
      .from('pdf_generation_queue')
      .insert({
        case_id: caseId,
        template_type: templateType
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to enqueue PDF job:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'ENQUEUE_FAILED',
          message: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`✅ PDF job enqueued: ${job.id} (${templateType} for case ${caseId})`);

    return new Response(
      JSON.stringify({
        success: true,
        jobId: job.id,
        status: 'queued',
        message: 'PDF generation job queued successfully',
        estimatedTime: '30-60 seconds'
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
        error: 'INTERNAL_ERROR',
        message: getErrorMessage(error) 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
