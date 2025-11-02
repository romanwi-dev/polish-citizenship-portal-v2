import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId, templateType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch case data and documents
    const { data: caseData } = await supabase
      .from('cases')
      .select('*, documents(*)')
      .eq('id', caseId)
      .single();

    const systemPrompt = `You are an expert guide for Polish citizenship document assembly.
Generate a step-by-step guide for organizing and preparing documents for submission.`;

    const userPrompt = `Template Type: ${templateType}
Case Info: ${JSON.stringify(caseData, null, 2)}

Generate an assembly guide in this exact JSON format:
{
  "steps": [
    {
      "order": 1,
      "title": "Step title",
      "description": "Detailed description",
      "documents": ["doc1", "doc2"],
      "tips": ["tip1", "tip2"],
      "critical": true/false
    }
  ]
}

Focus on:
1. Logical document ordering
2. Translation requirements
3. Apostille/legalization needs
4. Photocopying vs originals
5. Binding/fastening instructions`;

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
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI guide generation failed: ${response.status}`);
    }

    const aiResult = await response.json();
    const content = aiResult.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const guide = jsonMatch ? JSON.parse(jsonMatch[0]) : { steps: [] };

    return new Response(
      JSON.stringify(guide),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ai-document-guide:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage, steps: [] }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
