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
    
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured');
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

    // Prepare verification prompt
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

    // Call OpenAI for verification
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const aiResponse = await response.json();
    const verification = JSON.parse(aiResponse.choices[0].message.content);

    console.log(`Verification complete for ${formType}: ${verification.isValid ? 'VALID' : 'ISSUES FOUND'}`);

    return new Response(
      JSON.stringify({
        success: true,
        formType,
        caseId,
        verification,
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