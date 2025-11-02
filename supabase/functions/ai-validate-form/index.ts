import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formData, templateType, checkType = 'standard' } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build validation prompt based on check type
    let systemPrompt = `You are an expert validator for Polish citizenship application forms.
Validate the provided form data and return structured validation results.`;

    if (checkType === 'pre-print') {
      systemPrompt += `\n\nThis is a PRE-PRINT VERIFICATION. Be extremely thorough and check:
1. Polish character validation (ą, ć, ę, ł, ń, ó, ś, ź, ż)
2. Date format strictly DD.MM.YYYY with valid ranges
3. Passport numbers match expected format
4. All mandatory fields are filled
5. Name consistency across all fields
6. Address formatting for Polish standards`;
    }

    const userPrompt = `Template: ${templateType}
Form Data: ${JSON.stringify(formData, null, 2)}

Validate and return results in this exact JSON format:
{
  "isValid": boolean,
  "errors": [
    {
      "field": "field_name",
      "error": "error description",
      "suggestion": "suggested correction",
      "severity": "critical" | "warning" | "info"
    }
  ],
  "corrections": [
    {
      "field": "field_name",
      "original": "original value",
      "corrected": "corrected value"
    }
  ],
  "checks": {
    "polish_chars": { "passed": true/false, "message": "..." },
    "dates": { "passed": true/false, "message": "..." },
    "passport": { "passed": true/false, "message": "..." },
    "mandatory_fields": { "passed": true/false, "message": "..." },
    "name_consistency": { "passed": true/false, "message": "..." },
    "address_format": { "passed": true/false, "message": "..." }
  }
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI validation error:', response.status, errorText);
      throw new Error(`AI validation failed: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices[0].message.content;
    
    // Parse JSON from AI response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const validationResult = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      isValid: true,
      errors: [],
      corrections: [],
      checks: {}
    };

    console.log('AI Validation Result:', validationResult);

    return new Response(
      JSON.stringify(validationResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-validate-form:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        isValid: true, // Fail open
        errors: [],
        corrections: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
