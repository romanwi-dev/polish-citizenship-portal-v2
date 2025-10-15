import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslateRequest {
  jobId: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  documentType?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { jobId, sourceText, sourceLanguage, targetLanguage = 'PL', documentType }: TranslateRequest = await req.json();

    if (!jobId || !sourceText || !sourceLanguage) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Update job status to ai_translating
    await supabase
      .from('translation_jobs')
      .update({ status: 'ai_translating' })
      .eq('id', jobId);

    console.log(`Translating from ${sourceLanguage} to ${targetLanguage}...`);

    const languageNames: Record<string, string> = {
      'EN': 'English',
      'ES': 'Spanish',
      'PT': 'Portuguese',
      'HE': 'Hebrew',
      'RU': 'Russian',
      'UK': 'Ukrainian',
      'DE': 'German',
      'FR': 'French',
      'PL': 'Polish'
    };

    const systemPrompt = `You are a professional legal translator specializing in Polish citizenship and civil registry documents.

Your expertise includes:
- Legal terminology in ${languageNames[sourceLanguage]} and Polish
- Official document translation (birth certificates, marriage certificates, naturalization papers)
- Historical documents and archival records
- Maintaining legal accuracy and proper formatting
- Polish administrative and legal language

Translation guidelines:
1. Translate EXACTLY and LITERALLY - legal documents require precision
2. Maintain formatting and structure
3. Translate names appropriately but note original spellings
4. Keep dates in standard formats (DD.MM.YYYY)
5. Preserve all legal terms and official language
6. Note any ambiguities or unclear passages
7. This translation will be reviewed and certified by a Polish Sworn Translator

Return ONLY valid JSON in this format:
{
  "translation": "The complete Polish translation...",
  "confidence": 0.95,
  "notes": ["Any translator notes about ambiguities or special cases"],
  "glossary": {
    "key_term_1": "translation_1",
    "key_term_2": "translation_2"
  }
}`;

    const userPrompt = `Translate the following ${documentType || 'document'} from ${languageNames[sourceLanguage]} to Polish:

${sourceText}`;

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.1, // Low for accuracy
        max_tokens: 4000
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', aiResponse.status, errorText);
      throw new Error(`AI translation failed: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const resultText = aiData.choices?.[0]?.message?.content;

    if (!resultText) {
      throw new Error('No response from AI');
    }

    console.log('Raw AI response:', resultText);

    let translationResult: any;
    try {
      const jsonMatch = resultText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || resultText.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : resultText;
      translationResult = JSON.parse(jsonText.trim());
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback: use the entire response as translation
      translationResult = {
        translation: resultText,
        confidence: 0.70,
        notes: ['AI response could not be parsed as JSON - using raw response']
      };
    }

    // Update translation job with AI results
    const { error: updateError } = await supabase
      .from('translation_jobs')
      .update({
        ai_translation: translationResult.translation,
        ai_confidence: translationResult.confidence,
        status: translationResult.confidence >= 0.85 ? 'ai_complete' : 'human_review',
        metadata: {
          ...translationResult,
          translated_at: new Date().toISOString()
        }
      })
      .eq('id', jobId);

    if (updateError) {
      console.error('Failed to update translation job:', updateError);
      throw updateError;
    }

    // Create history entry
    await supabase.from('translation_job_history').insert({
      job_id: jobId,
      change_type: 'ai_translation_complete',
      new_value: `Confidence: ${(translationResult.confidence * 100).toFixed(0)}%`,
      notes: translationResult.notes?.join('; ')
    });

    console.log(`AI translation completed with ${(translationResult.confidence * 100).toFixed(0)}% confidence`);

    return new Response(
      JSON.stringify({
        success: true,
        translation: translationResult.translation,
        confidence: translationResult.confidence,
        notes: translationResult.notes,
        glossary: translationResult.glossary,
        needsReview: translationResult.confidence < 0.85
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation error:', error);
    
    // Update job status to failed if we have jobId
    try {
      const { jobId } = await req.json();
      if (jobId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase
          .from('translation_jobs')
          .update({ 
            status: 'human_review',
            notes: `AI translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
          })
          .eq('id', jobId);
      }
    } catch (e) {
      console.error('Failed to update error status:', e);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});