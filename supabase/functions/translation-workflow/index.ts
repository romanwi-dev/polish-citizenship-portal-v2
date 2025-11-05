import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslationRequest {
  action: 'start_ai' | 'approve' | 'reject';
  job_id: string;
  hac_notes?: string;
}

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

    const { action, job_id, hac_notes } = await req.json() as TranslationRequest;

    if (!job_id) {
      return new Response(
        JSON.stringify({ error: 'job_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch the translation job
    const { data: job, error: jobError } = await supabaseClient
      .from('translation_jobs')
      .select('*, cases!inner(id)')
      .eq('id', job_id)
      .single();

    if (jobError || !job) {
      console.error('Error fetching job:', jobError);
      return new Response(
        JSON.stringify({ error: 'Translation job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check AI consent for PII processing
    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (action === 'start_ai') {
      // Check if AI consent is granted for this case
      const { data: consentData, error: consentError } = await supabaseClient
        .rpc('check_ai_consent', { p_case_id: job.case_id });

      if (consentError) {
        console.error('Error checking AI consent:', consentError);
        return new Response(
          JSON.stringify({ error: 'Failed to check AI consent' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!consentData) {
        return new Response(
          JSON.stringify({ error: 'AI processing consent not granted for this case' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Log PII processing
      await supabaseClient.from('ai_pii_processing_logs').insert({
        case_id: job.case_id,
        document_id: job.document_id,
        operation_type: 'translation',
        ai_provider: 'lovable-ai',
        pii_fields_sent: {
          source_text: true,
          document_name: true,
        },
        user_id: user?.id,
      });

      // Update job to ai_translating stage
      await supabaseClient
        .from('translation_jobs')
        .update({ 
          workflow_stage: 'ai_translating',
          metadata: { ...job.metadata, started_at: new Date().toISOString() }
        })
        .eq('id', job_id);

      // Get source text from metadata or document
      const sourceText = job.metadata?.source_text || job.source_text;

      if (!sourceText) {
        throw new Error('No source text available for translation');
      }

      // Call Lovable AI for translation
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY is not configured');
      }

      const systemPrompt = `You are a professional Polish Certified Sworn Translator specializing in legal and official documents for Polish citizenship applications.

Your task is to translate documents with:
1. Legal accuracy and formal Polish terminology
2. Preservation of all names, dates, and official numbers
3. Proper Polish legal document formatting
4. Certification-ready quality

Translate the following ${job.source_language} text to ${job.target_language}.`;

      const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: sourceText }
          ],
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error('Lovable AI error:', aiResponse.status, errorText);

        if (aiResponse.status === 429) {
          await supabaseClient
            .from('translation_jobs')
            .update({ 
              workflow_stage: 'pending',
              metadata: { ...job.metadata, error: 'Rate limit exceeded. Please try again later.' }
            })
            .eq('id', job_id);

          return new Response(
            JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (aiResponse.status === 402) {
          await supabaseClient
            .from('translation_jobs')
            .update({ 
              workflow_stage: 'pending',
              metadata: { ...job.metadata, error: 'Payment required. Please add credits to your workspace.' }
            })
            .eq('id', job_id);

          return new Response(
            JSON.stringify({ error: 'Payment required. Please add credits to your Lovable workspace.' }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        throw new Error(`AI translation failed: ${errorText}`);
      }

      const aiData = await aiResponse.json();
      const translatedText = aiData.choices[0].message.content;

      // Calculate confidence score (simple heuristic based on length ratio)
      const lengthRatio = translatedText.length / sourceText.length;
      const confidenceScore = Math.min(95, Math.max(60, 80 - Math.abs(1 - lengthRatio) * 20));

      // Update job with AI translation
      const { error: updateError } = await supabaseClient
        .from('translation_jobs')
        .update({
          ai_translated_text: translatedText,
          ai_confidence_score: confidenceScore,
          workflow_stage: 'ai_complete',
          metadata: {
            ...job.metadata,
            completed_at: new Date().toISOString(),
            model: 'google/gemini-2.5-flash',
          }
        })
        .eq('id', job_id);

      if (updateError) {
        console.error('Error updating job:', updateError);
        throw updateError;
      }

      // Add history entry
      await supabaseClient.from('translation_job_history').insert({
        job_id: job_id,
        change_type: 'ai_translation_complete',
        old_value: job.workflow_stage,
        new_value: 'ai_complete',
        changed_by: user?.id,
        metadata: {
          confidence_score: confidenceScore,
          model: 'google/gemini-2.5-flash',
        }
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          translated_text: translatedText,
          confidence_score: confidenceScore,
          workflow_stage: 'ai_complete'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'approve') {
      const { error: updateError } = await supabaseClient
        .from('translation_jobs')
        .update({
          workflow_stage: 'approved',
          hac_approved: true,
          hac_approved_by: user?.id,
          hac_approved_at: new Date().toISOString(),
          hac_notes: hac_notes,
        })
        .eq('id', job_id);

      if (updateError) throw updateError;

      await supabaseClient.from('translation_job_history').insert({
        job_id: job_id,
        change_type: 'hac_approved',
        old_value: job.workflow_stage,
        new_value: 'approved',
        changed_by: user?.id,
        metadata: { notes: hac_notes }
      });

      return new Response(
        JSON.stringify({ success: true, workflow_stage: 'approved' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'reject') {
      const { error: updateError } = await supabaseClient
        .from('translation_jobs')
        .update({
          workflow_stage: 'hac_review',
          hac_notes: hac_notes,
        })
        .eq('id', job_id);

      if (updateError) throw updateError;

      await supabaseClient.from('translation_job_history').insert({
        job_id: job_id,
        change_type: 'hac_rejected',
        old_value: job.workflow_stage,
        new_value: 'hac_review',
        changed_by: user?.id,
        metadata: { notes: hac_notes }
      });

      return new Response(
        JSON.stringify({ success: true, workflow_stage: 'hac_review' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation workflow error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
