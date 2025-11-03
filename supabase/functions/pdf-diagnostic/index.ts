import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Step 1: Get actual storage files
    const { data: storageFiles, error: storageError } = await admin.storage
      .from('pdf-templates')
      .list();

    if (storageError) throw storageError;

    // Step 2: Test download of each template
    const testResults = [];
    const templates = ['poa-adult.pdf', 'poa-minor.pdf', 'poa-spouses.pdf', 'family-tree.pdf', 'citizenship.pdf'];
    
    for (const template of templates) {
      try {
        const { data, error } = await admin.storage.from('pdf-templates').download(template);
        testResults.push({
          template,
          exists: !error,
          size: data ? (await data.arrayBuffer()).byteLength : 0,
          error: error?.message || null
        });
      } catch (e) {
        testResults.push({
          template,
          exists: false,
          size: 0,
          error: String(e)
        });
      }
    }

    // Step 3: OpenAI Analysis
    const diagnosticData = {
      timestamp: new Date().toISOString(),
      storageFiles: storageFiles?.map(f => f.name) || [],
      downloadTests: testResults,
      expectedTemplates: templates
    };

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: 'You are a PDF system diagnostician. Analyze storage data and provide JSON with: {status:"OK"|"ERROR", issues:[], fixes:[]}'
          },
          {
            role: 'user',
            content: `STORAGE FILES: ${JSON.stringify(storageFiles?.map(f => f.name))}
            
DOWNLOAD TESTS: ${JSON.stringify(testResults, null, 2)}

EXPECTED: ${JSON.stringify(templates)}

Analyze: Are all templates present and downloadable? Any mismatches?`
          }
        ],
        max_completion_tokens: 300
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      throw new Error(`OpenAI failed: ${aiResponse.status} ${errorText}`);
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;

    return new Response(
      JSON.stringify({
        protocol: 'OpenAI Verification',
        diagnostics: diagnosticData,
        aiAnalysis: analysis,
        verifiedBy: 'OpenAI GPT-5-mini',
        timestamp: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Diagnostic error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
