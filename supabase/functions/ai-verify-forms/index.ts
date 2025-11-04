import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyRequest {
  caseId: string;
  formType: 'intake' | 'oby' | 'master';
}

interface VerificationResult {
  isValid: boolean;
  confidence: number;
  issues: Array<{
    field: string;
    severity: 'critical' | 'warning' | 'info';
    message: string;
  }>;
  suggestions: string[];
  completeness: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId, formType } = await req.json() as VerifyRequest;

    if (!caseId || !formType) {
      throw new Error('Missing required fields: caseId, formType');
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }
    if (!lovableKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Verifying ${formType} form for case ${caseId}`);

    // Fetch form data based on type
    let formData: any = null;
    let tableName = '';
    
    switch (formType) {
      case 'intake':
        tableName = 'intake_data';
        break;
      case 'oby':
        tableName = 'oby_forms';
        break;
      case 'master':
        tableName = 'master_table';
        break;
    }

    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('case_id', caseId)
      .single();

    if (error || !data) {
      throw new Error(`Failed to fetch ${formType} data: ${error?.message}`);
    }

    formData = data;

    // Prepare verification prompt (same for both AIs)
    const systemPrompt = `You are a data quality verification AI for Polish citizenship applications.
Analyze the form data for completeness, consistency, and potential issues.

Return a JSON object with:
{
  "isValid": boolean,
  "confidence": number (0-100),
  "issues": [
    {
      "field": "field_name",
      "severity": "critical" | "warning" | "info",
      "message": "description of issue"
    }
  ],
  "suggestions": [
    "improvement suggestion 1",
    "improvement suggestion 2"
  ],
  "completeness": number (0-100)
}`;

    const userPrompt = `Verify this ${formType} form data:

${JSON.stringify(formData, null, 2)}

Check for:
1. Missing required fields
2. Data inconsistencies (e.g., dates out of order)
3. Formatting issues
4. Logical errors
5. Completeness`;

    // DUAL AI VERIFICATION: Call both OpenAI and Gemini in parallel
    console.log(`Starting dual AI verification for ${formType}...`);
    
    const [openaiResult, geminiResult] = await Promise.all([
      // OpenAI GPT-5-nano verification
      (async () => {
        try {
          const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-5-nano-2025-08-07',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              response_format: { type: "json_object" }
            }),
          });

          if (!response.ok) {
            const error = await response.text();
            throw new Error(`OpenAI API error: ${error}`);
          }

          const aiResponse = await response.json();
          const verification: VerificationResult = JSON.parse(aiResponse.choices[0].message.content);
          console.log(`OpenAI verification: ${verification.isValid ? 'VALID' : 'ISSUES'} (confidence: ${verification.confidence}%)`);
          return { ...verification, raw: aiResponse };
        } catch (error) {
          console.error('OpenAI verification failed:', error);
          throw error;
        }
      })(),
      
      // Gemini verification via Lovable AI
      (async () => {
        try {
          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
              ],
              response_format: { type: "json_object" }
            }),
          });

          if (!response.ok) {
            const error = await response.text();
            throw new Error(`Gemini API error: ${error}`);
          }

          const aiResponse = await response.json();
          const verification: VerificationResult = JSON.parse(aiResponse.choices[0].message.content);
          console.log(`Gemini verification: ${verification.isValid ? 'VALID' : 'ISSUES'} (confidence: ${verification.confidence}%)`);
          return { ...verification, raw: aiResponse };
        } catch (error) {
          console.error('Gemini verification failed:', error);
          throw error;
        }
      })()
    ]);

    // Analyze consensus between the two AIs
    const consensus = {
      valid: openaiResult.isValid && geminiResult.isValid,
      confidence: Math.round((openaiResult.confidence + geminiResult.confidence) / 2),
      disagreements: [] as any[]
    };

    // Detect disagreements
    if (openaiResult.isValid !== geminiResult.isValid) {
      consensus.disagreements.push({
        type: 'validity',
        openai: openaiResult.isValid,
        gemini: geminiResult.isValid,
        description: 'AIs disagree on overall form validity'
      });
    }

    if (Math.abs(openaiResult.confidence - geminiResult.confidence) > 20) {
      consensus.disagreements.push({
        type: 'confidence',
        openai: openaiResult.confidence,
        gemini: geminiResult.confidence,
        description: 'Significant confidence gap between AIs'
      });
    }

    console.log(`Consensus: ${consensus.valid ? 'VALID' : 'ISSUES'} (avg confidence: ${consensus.confidence}%)`);
    if (consensus.disagreements.length > 0) {
      console.warn(`⚠️ ${consensus.disagreements.length} disagreements detected`);
    }

    // Store results in database
    const { error: insertError } = await supabase
      .from('ai_verification_results')
      .upsert({
        case_id: caseId,
        form_type: formType,
        openai_is_valid: openaiResult.isValid,
        openai_confidence: openaiResult.confidence,
        openai_issues: openaiResult.issues,
        openai_suggestions: openaiResult.suggestions,
        openai_completeness: openaiResult.completeness,
        openai_raw_response: openaiResult.raw,
        gemini_is_valid: geminiResult.isValid,
        gemini_confidence: geminiResult.confidence,
        gemini_issues: geminiResult.issues,
        gemini_suggestions: geminiResult.suggestions,
        gemini_completeness: geminiResult.completeness,
        gemini_raw_response: geminiResult.raw,
        consensus_valid: consensus.valid,
        consensus_confidence: consensus.confidence,
        disagreements: consensus.disagreements,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'case_id,form_type'
      });

    if (insertError) {
      console.error('Failed to store verification results:', insertError);
      throw insertError;
    }

    console.log(`✓ Verification results stored for ${formType}`);

    return new Response(
      JSON.stringify({
        success: true,
        formType,
        caseId,
        openai: openaiResult,
        gemini: geminiResult,
        consensus,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('AI Verification error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});