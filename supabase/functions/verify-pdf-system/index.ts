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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const { analysisType } = await req.json();

    // Define the system code to analyze
    const frontendCode = `
/**
 * Shared PDF generation utilities for Polish Citizenship Portal
 * Supports all template types with signed URLs and base64 fallback
 */

export function downloadUrl(href: string, filename?: string) {
  const a = document.createElement('a');
  a.href = href;
  if (filename) a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function base64ToBlob(b64: string, mime = 'application/pdf') {
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export async function generatePdfViaEdge({
  supabase,
  caseId,
  templateType,
  toast,
  setIsGenerating,
  filename,
}: {
  supabase: any;
  caseId: string;
  templateType: string;
  toast: any;
  setIsGenerating: (b: boolean) => void;
  filename: string;
}) {
  if (!caseId || caseId === ':id' || caseId === 'demo-preview') {
    toast.error('PDF generation not available in demo mode');
    return;
  }

  try {
    setIsGenerating(true);
    toast.loading('Generating PDF...');

    const { data, error } = await supabase.functions.invoke('fill-pdf', {
      body: { caseId, templateType },
    });
    if (error) throw error;

    // Prefer signed URL
    if (data?.url) {
      downloadUrl(data.url, data.filename ?? filename);
      toast.dismiss();
      toast.success('PDF generated successfully!');
      return;
    }

    // Fallback to base64
    if (data?.pdf) {
      const blob = base64ToBlob(data.pdf);
      const url = URL.createObjectURL(blob);
      downloadUrl(url, filename);
      URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('PDF generated successfully!');
      return;
    }

    if (data?.error) throw new Error(data.error);
    throw new Error('No URL or PDF returned from server');
  } catch (err: any) {
    toast.dismiss();
    console.error('PDF generation error:', err);
    toast.error(\`Failed to generate PDF: \${err.message ?? err}\`);
  } finally {
    setIsGenerating(false);
  }
}
`;

    const backendCode = `
// Edge function excerpt - diagnostics mode
if (mode === 'diagnose') {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const hasSecrets = Boolean(url && key);
  let uploadOk = false, signOk = false, diagError = null;
  
  try {
    if (hasSecrets) {
      const sb = createClient(url!, key!);
      const path = \`diagnostics/\${Date.now()}.txt\`;
      const bytes = new TextEncoder().encode('diagnostic test');
      
      const { error: upErr } = await sb.storage
        .from('generated-pdfs')
        .upload(path, bytes, { contentType: 'text/plain', upsert: true });
      uploadOk = !upErr;
      
      const { data: signed, error: sErr } = await sb.storage
        .from('generated-pdfs')
        .createSignedUrl(path, 60);
      signOk = Boolean(signed?.signedUrl && !sErr);
    }
  } catch (e) {
    diagError = String((e as Error)?.message ?? e);
  }
  
  return new Response(
    JSON.stringify({ ok: hasSecrets && uploadOk && signOk, hasSecrets, uploadOk, signOk, diagError }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
  );
}

// Template validation
const validTemplates = [
  'citizenship', 'family-tree', 'transcription', 'registration',
  'poa-adult', 'poa-minor', 'poa-spouses',
  'umiejscowienie', 'uzupelnienie' // Legacy
];

if (!templateType || !validTemplates.includes(templateType)) {
  return new Response(
    JSON.stringify({ error: 'Valid templateType is required' }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Upload to Storage and return signed URL
const filename = \`\${caseId}/\${templateType}-\${Date.now()}.pdf\`;
const { error: uploadErr } = await supabaseClient.storage
  .from('generated-pdfs')
  .upload(filename, filledPdfBytes, { contentType: 'application/pdf', upsert: true });

if (uploadErr) {
  return new Response(
    JSON.stringify({ error: \`Storage upload failed: \${uploadErr.message}\` }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
  );
}

const { data: signed, error: signedErr } = await supabaseClient.storage
  .from('generated-pdfs')
  .createSignedUrl(filename, 60 * 10);

if (signedErr) {
  return new Response(
    JSON.stringify({ error: \`Failed to create signed URL: \${signedErr.message}\` }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
  );
}

return new Response(
  JSON.stringify({ 
    url: signed.signedUrl,
    filename: filename.split('/').pop(),
    stats: { filled: fillResult.filledFields, total: fillResult.totalFields }
  }),
  { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
);
`;

    // Call Lovable AI for analysis
    const systemPrompt = `You are an expert software architect reviewing a PDF generation system for a Polish Citizenship Portal.

ANALYSIS CRITERIA:
1. **Security**: Check for vulnerabilities, proper error handling, secrets management
2. **Reliability**: Verify fallback mechanisms, error recovery, edge cases
3. **Performance**: Assess efficiency, caching, resource usage
4. **Architecture**: Evaluate design patterns, code organization, maintainability
5. **Best Practices**: Check adherence to industry standards
6. **iOS Safari Compatibility**: Verify download mechanisms work on iOS
7. **Signed URLs**: Validate expiry times, security, proper cleanup
8. **CORS**: Ensure proper cross-origin configuration
9. **Diagnostics**: Evaluate monitoring and debugging capabilities
10. **Template Support**: Verify all 7 template types are properly handled

REQUIRED TEMPLATE TYPES TO VERIFY:
- poa-adult, poa-minor, poa-spouses
- citizenship
- family-tree  
- registration (umiejscowienie)
- transcription (uzupełnienie)

OUTPUT FORMAT:
Return a structured analysis with:
- Overall Grade (A-F)
- Critical Issues (severity: critical/high/medium/low)
- Security Assessment
- Reliability Score (1-10)
- Recommendations (prioritized)
- Testing Checklist
- Production Readiness (yes/no with justification)`;

    const userPrompt = `Analyze this comprehensive PDF generation system:

**FRONTEND CODE (src/lib/pdf.ts):**
\`\`\`typescript
${frontendCode}
\`\`\`

**BACKEND CODE (supabase/functions/fill-pdf/index.ts - key excerpts):**
\`\`\`typescript
${backendCode}
\`\`\`

**IMPLEMENTATION DETAILS:**
- Storage: Private bucket 'generated-pdfs', organized by case ID
- Signed URLs: 10-minute expiry (600 seconds)
- Fallback: Base64 if signed URL fails
- Forms using this: CitizenshipForm, FamilyTreeForm, CivilRegistryForm (2 types), POAForm (3 types)
- CORS: Enabled with proper headers
- Diagnostics: Available via mode='diagnose'

**ANALYSIS TYPE:** ${analysisType || 'comprehensive'}

Provide a detailed technical analysis focusing on production readiness and zero-fail requirements.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3, // Lower temperature for more precise analysis
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to Lovable AI.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const analysis = aiData.choices?.[0]?.message?.content;

    if (!analysis) {
      throw new Error('No analysis returned from AI');
    }

    return new Response(
      JSON.stringify({ 
        analysis,
        timestamp: new Date().toISOString(),
        model: 'openai/gpt-5',
        analysisType: analysisType || 'comprehensive'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: String(error)
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
