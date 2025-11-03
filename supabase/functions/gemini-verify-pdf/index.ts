import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get recent successful generations
    const { data: recentPDFs } = await admin
      .from('generated_documents')
      .select('template_type, created_at, path')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10);

    // Get storage templates
    const { data: templates } = await admin.storage
      .from('pdf-templates')
      .list();

    // Test template downloads
    const testResults = [];
    const templateTypes = ['poa-adult.pdf', 'poa-minor.pdf', 'poa-spouses.pdf', 'family-tree.pdf', 'citizenship.pdf'];
    
    for (const template of templateTypes) {
      try {
        const { data, error } = await admin.storage.from('pdf-templates').download(template);
        testResults.push({
          template,
          status: error ? 'FAIL' : 'OK',
          size: data ? (await data.arrayBuffer()).byteLength : 0,
          error: error?.message
        });
      } catch (e) {
        testResults.push({ template, status: 'ERROR', error: String(e) });
      }
    }

    const systemData = {
      timestamp: new Date().toISOString(),
      recentGenerations: recentPDFs?.length || 0,
      lastSuccess: recentPDFs?.[0]?.created_at || 'none',
      templateTests: testResults,
      templatesInStorage: templates?.map(t => t.name) || []
    };

    // Gemini Analysis
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a PDF system validator. Analyze the data and return JSON: {status:"OPERATIONAL"|"DEGRADED"|"FAILED", score:0-100, issues:[], recommendations:[]}'
          },
          {
            role: 'user',
            content: `SYSTEM STATUS:
Recent PDF Generations: ${systemData.recentGenerations}
Last Success: ${systemData.lastSuccess}

TEMPLATE DOWNLOAD TESTS:
${JSON.stringify(testResults, null, 2)}

STORAGE FILES:
${JSON.stringify(systemData.templatesInStorage)}

Analyze: Is the PDF generation system fully operational? Are all templates accessible?`
          }
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API failed: ${response.status}`);
    }

    const aiData = await response.json();
    const analysis = aiData.choices[0].message.content;

    let parsedAnalysis;
    try {
      parsedAnalysis = JSON.parse(analysis);
    } catch {
      parsedAnalysis = { raw: analysis };
    }

    return new Response(
      JSON.stringify({
        protocol: 'Gemini Verification',
        systemData,
        geminiAnalysis: parsedAnalysis,
        verifiedBy: 'Google Gemini 2.5 Flash',
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Verification error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
