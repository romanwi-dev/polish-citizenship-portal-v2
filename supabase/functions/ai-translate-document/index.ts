import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslationRequest {
  jobId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    
    if (!lovableApiKey) {
      console.error('[AI Translate] LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    const { jobId }: TranslationRequest = await req.json();

    console.log(`[AI Translate] Processing job: ${jobId}`);

    // Get translation job
    const { data: job, error: jobError } = await supabase
      .from('translation_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      console.error('[AI Translate] Job not found:', jobError);
      return new Response(
        JSON.stringify({ error: 'Translation job not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (job.workflow_stage !== 'ai_translating') {
      return new Response(
        JSON.stringify({ error: 'Job must be in ai_translating stage' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare translation prompt
    const systemPrompt = `You are a professional Polish document translator specializing in legal and official documents for citizenship applications. 
Your translations must be:
- Accurate and precise
- Formal and appropriate for official government submissions
- Consistent with Polish legal terminology
- Preserving all dates, names, and numbers exactly as provided
- Following Polish document formatting conventions

When translating from ${job.source_language} to ${job.target_language}, maintain the original meaning while adapting to proper Polish administrative language.`;

    const userPrompt = `Translate the following ${job.document_type || 'document'} from ${job.source_language} to ${job.target_language}:

${job.source_text}

Provide ONLY the translation, without any explanations or notes.`;

    console.log(`[AI Translate] Calling Lovable AI for translation...`);

    // Call Lovable AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3, // Lower temperature for more consistent translations
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('[AI Translate] AI API error:', aiResponse.status, errorText);
      
      // Handle rate limits
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: 'AI service rate limit exceeded, please try again later' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Handle payment required
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service credits exhausted, please add credits to your workspace' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`AI service error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const translation = aiData.choices?.[0]?.message?.content;

    if (!translation) {
      console.error('[AI Translate] No translation in response:', aiData);
      throw new Error('No translation received from AI service');
    }

    console.log(`[AI Translate] Translation completed, length: ${translation.length} chars`);

    // Calculate confidence score based on response quality indicators
    // This is a simplified approach - in production you might use more sophisticated methods
    const confidence = calculateConfidence(job.source_text, translation, aiData);

    // Update job with AI translation
    const { error: updateError } = await supabase
      .from('translation_jobs')
      .update({
        ai_translation: translation,
        ai_confidence: confidence,
        ai_translated_at: new Date().toISOString(),
        workflow_stage: 'ai_complete',
        status: 'ai_complete',
        stage_entered_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('[AI Translate] Update error:', updateError);
      throw updateError;
    }

    // Create history entry
    await supabase
      .from('translation_job_history')
      .insert({
        job_id: jobId,
        change_type: 'ai_translation_complete',
        changed_by: user.id,
        new_value: `AI translation completed with ${(confidence * 100).toFixed(0)}% confidence`,
        notes: `Translated ${job.source_text.length} characters from ${job.source_language} to ${job.target_language}`
      });

    console.log(`[AI Translate] Job ${jobId} completed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        translation,
        confidence,
        workflow_stage: 'ai_complete'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[AI Translate] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'AI translation failed';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Calculate confidence score for the translation
 * Based on various quality indicators
 */
function calculateConfidence(sourceText: string, translation: string, aiResponse: any): number {
  let confidence = 0.85; // Base confidence for Gemini translations

  // Check length ratio (translations should be relatively similar in length)
  const lengthRatio = translation.length / sourceText.length;
  if (lengthRatio >= 0.7 && lengthRatio <= 1.5) {
    confidence += 0.05;
  } else if (lengthRatio < 0.5 || lengthRatio > 2.0) {
    confidence -= 0.15;
  }

  // Check if translation is not just a copy of source
  if (translation.trim() === sourceText.trim()) {
    confidence = 0.3; // Very low confidence if no actual translation
  }

  // Check for common translation issues
  if (translation.includes('[') && translation.includes(']')) {
    confidence -= 0.1; // Penalize if translation contains bracketed notes
  }

  if (translation.toLowerCase().includes('translate') || translation.toLowerCase().includes('translation')) {
    confidence -= 0.15; // Penalize if AI is explaining rather than translating
  }

  // Check if finish_reason is 'stop' (complete response)
  if (aiResponse.choices?.[0]?.finish_reason === 'stop') {
    confidence += 0.05;
  }

  // Ensure confidence is between 0 and 1
  return Math.max(0, Math.min(1, confidence));
}
