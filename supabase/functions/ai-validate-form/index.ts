import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// In-memory cache for validation results
const validationCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Cleanup expired cache entries
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, value] of validationCache.entries()) {
    if (now - value.timestamp > CACHE_TTL) {
      validationCache.delete(key);
    }
  }
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

    // Generate cache key (first 100 chars of stringified data for uniqueness)
    const cacheKey = `${templateType}-${checkType}-${JSON.stringify(formData).substring(0, 100)}`;
    
    // Check cache first
    cleanupCache();
    const cached = validationCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log('Returning cached validation result');
      return new Response(
        JSON.stringify(cached.result),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build validation prompt based on check type
    let systemPrompt = `You are an expert validator for Polish citizenship application forms.
Validate the provided form data and return structured validation results.

CRITICAL VALIDATION RULES:

1. POLISH CHARACTERS: Names MUST use proper Polish diacritics (ą, ć, ę, ł, ń, ó, ś, ź, ż).
   - REJECT: "Kowalski" with plain letters if should be "Kowalśki"
   - Common errors: Using a/c/e/l/n/o/s/z instead of ą/ć/ę/ł/ń/ó/ś/ź/ż
   
2. DATE FORMAT: Strictly DD.MM.YYYY where:
   - DD: 01-31 (day must be valid for the month)
   - MM: 01-12
   - YYYY: Must be ≤ 2030
   - Regex: ^(0[1-9]|[12][0-9]|3[01])\\.(0[1-9]|1[0-2])\\.(19|20)\\d{2}$
   
3. POLISH PASSPORT: Format AA1234567 (2 uppercase letters + 7 digits)
   - Regex: ^[A-Z]{2}[0-9]{7}$
   
4. CROSS-FIELD RELATIONSHIPS:
   - Father's last name SHOULD equal paternal grandfather's last name
   - Mother's maiden name SHOULD equal maternal grandfather's last name
   - Children's last name inheritance: father's last name (default) OR mother's maiden name if father unknown
   - Date logic: birth_date < marriage_date < emigration_date < naturalization_date
   
5. NAME CONSISTENCY: Same person's name must be identical across all form sections`;

    if (checkType === 'pre-print') {
      systemPrompt += `\n\nThis is a PRE-PRINT VERIFICATION. Apply MAXIMUM strictness. Block printing if ANY critical errors exist.`;
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
    "polish_chars": { "passed": true/false, "message": "...", "critical": true },
    "dates": { "passed": true/false, "message": "...", "critical": true },
    "passport": { "passed": true/false, "message": "...", "critical": true },
    "mandatory_fields": { "passed": true/false, "message": "...", "critical": true },
    "name_consistency": { "passed": true/false, "message": "...", "critical": false },
    "address_format": { "passed": true/false, "message": "...", "critical": false },
    "cross_field_relationships": { "passed": true/false, "message": "...", "critical": false }
  }
}

Mark "critical": true for checks that MUST block PDF printing if failed.`;


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

    // Cache the result
    validationCache.set(cacheKey, {
      result: validationResult,
      timestamp: Date.now()
    });

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
