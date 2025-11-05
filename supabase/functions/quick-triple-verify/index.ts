import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { proposal } = await req.json();

    const OPENAI_KEY = Deno.env.get('OPENAI_API_KEY');
    const ANTHROPIC_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    const LOVABLE_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!OPENAI_KEY || !ANTHROPIC_KEY || !LOVABLE_KEY) {
      return new Response(JSON.stringify({ error: 'Missing required API keys' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const systemPrompt = `You are a senior software architect performing zero-fail verification. Analyze this code architecture deeply and provide:

1. VERDICT: APPROVE (100/100) or REJECT
2. SCORE: Must be exactly 100/100 to approve, otherwise 0-99
3. CRITICAL ISSUES: Any blocking problems (security, logic, architecture)
4. WARNINGS: Non-blocking concerns
5. RECOMMENDATION: Clear Go/No-Go with detailed reasoning

Standards for 100/100:
- Zero critical security vulnerabilities
- No architectural flaws or anti-patterns
- Proper error handling throughout
- Performance optimizations in place
- Code follows best practices
- No silent failures or data loss risks

Be extremely thorough. If you have ANY doubt, score below 100.`;

    const userPrompt = typeof proposal === 'string' 
      ? proposal 
      : `ARCHITECTURE REVIEW REQUEST:

${proposal.title || 'Code Analysis'}

${proposal.description || ''}

ANALYSIS SCOPE:
${proposal.scope || 'Full system review'}

KEY CONCERNS:
${proposal.concerns ? proposal.concerns.join('\n') : 'General code quality and architecture'}

FILES INVOLVED:
${proposal.files ? proposal.files.join('\n') : 'See attached proposal'}

DETAILS:
${JSON.stringify(proposal, null, 2)}`;
    // Parallel calls
    const results = await Promise.allSettled([
      // OpenAI
      fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-mini-2025-08-07',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_completion_tokens: 500,
        }),
      }).then(r => r.json()),

      // Anthropic (Claude)
      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 500,
          messages: [
            { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }
          ],
        }),
      }).then(r => r.json()),

      // Gemini via Lovable
      fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-pro',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 500,
        }),
      }).then(r => r.json()),
    ]);

    const processResult = (result: any, modelName: string) => {
      if (result.status === 'rejected') {
        return { model: modelName, error: result.reason?.message || 'Request failed' };
      }
      
      const data = result.value;
      let content = '';
      
      if (data.choices?.[0]?.message?.content) {
        content = data.choices[0].message.content; // OpenAI/Gemini
      } else if (data.content?.[0]?.text) {
        content = data.content[0].text; // Claude
      } else {
        return { model: modelName, error: 'No content in response' };
      }
      
      return { model: modelName, verdict: content };
    };

    const openai = processResult(results[0], 'OpenAI GPT-5 Mini');
    const claude = processResult(results[1], 'Claude Sonnet 4.5');
    const gemini = processResult(results[2], 'Gemini 2.5 Pro');

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      results: { openai, claude, gemini }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[quick-triple-verify] Error:', error);
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
