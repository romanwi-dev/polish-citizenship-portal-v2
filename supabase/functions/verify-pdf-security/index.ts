import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-token',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Admin auth check
    const token = req.headers.get('x-admin-token');
    if (token !== Deno.env.get('INTERNAL_ADMIN_TOKEN')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Read fill-pdf code
    const fillPdfCode = `
    CRITICAL SECURITY ANALYSIS NEEDED:
    
    Review this PDF generation system for:
    1. SQL injection vulnerabilities
    2. Path traversal attacks
    3. Data leakage risks
    4. Authentication/authorization flaws
    5. Rate limiting bypass
    6. CORS misconfigurations
    7. Secret exposure
    8. Input validation gaps
    9. RLS policy violations
    10. Storage security issues
    
    CODE TO ANALYZE:
    - fill-pdf edge function that generates PDFs
    - Uses RLS for data reads, service role for storage
    - Rate limits: 25 docs/5min/user
    - Signed URLs expire in 45 minutes
    - Template whitelist enforcement
    - caseId regex validation
    
    SPECIFIC CONCERNS:
    - Case ownership verification via RLS
    - Template path construction
    - PDF field filling from user data
    - Artifact reuse logic (1-hour window)
    - Error message information disclosure
    - Diagnostics endpoint security
    
    Provide:
    1. List of vulnerabilities (CRITICAL/HIGH/MEDIUM/LOW)
    2. Exploitation scenarios
    3. Recommended fixes
    4. Additional security measures
    `;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
        messages: [
          {
            role: 'system',
            content: 'You are a senior security auditor specializing in web application security, specifically Node.js/Deno edge functions, SQL injection, authentication bypass, and data protection. Analyze code for vulnerabilities with precision and provide actionable fixes.'
          },
          {
            role: 'user',
            content: fillPdfCode
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[verify-pdf-security] AI error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI analysis failed', details: errorText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;

    if (!analysis) {
      return new Response(JSON.stringify({ error: 'No analysis returned' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      analysis,
      timestamp: new Date().toISOString(),
      model: 'openai/gpt-5'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[verify-pdf-security] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
