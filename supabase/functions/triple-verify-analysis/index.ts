/**
 * Triple-Model Verification System for A→B→EX Protocol
 * Uses GPT-5, Gemini 2.5 Pro, and Claude Sonnet 4.5 for verification
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { analysis, context } = await req.json();

    console.log('[triple-verify] Starting triple-model verification...');

    const verificationPrompt = `You are a senior technical auditor. Review this Phase A analysis with extreme scrutiny.

ANALYSIS TO VERIFY:
${analysis}

PROJECT CONTEXT:
${context}

Your task:
1. Score the analysis quality (0-100)
2. Identify verified findings vs incorrect assumptions
3. List any missed critical issues
4. Provide recommendation: approve/revise/reject
5. Explain your reasoning

Be harsh and thorough. Only approve if the analysis is truly comprehensive and correct.`;

    // Run parallel verification across all 3 models
    const [gpt5Result, geminiResult, claudeResult] = await Promise.all([
      verifyWithGPT5(verificationPrompt),
      verifyWithGemini(verificationPrompt),
      verifyWithClaude(verificationPrompt),
    ]);

    // Calculate consensus across all 3 models
    const avgScore = (gpt5Result.overall_score + geminiResult.overall_score + claudeResult.overall_score) / 3;
    
    const scores = [gpt5Result.overall_score, geminiResult.overall_score, claudeResult.overall_score];
    const maxDiff = Math.max(...scores) - Math.min(...scores);
    
    const unanimousApproval = 
      gpt5Result.recommendation === 'approve' && 
      geminiResult.recommendation === 'approve' &&
      claudeResult.recommendation === 'approve';
    
    const allScoresAt100 = 
      gpt5Result.overall_score === 100 && 
      geminiResult.overall_score === 100 &&
      claudeResult.overall_score === 100;

    const agreementLevel = maxDiff <= 5 ? 'high' : maxDiff <= 15 ? 'medium' : 'low';
    
    // STRICT: All 3 models must score 100% and approve
    const verdict = (unanimousApproval && allScoresAt100 && agreementLevel === 'high') 
      ? 'PROCEED_TO_EX' 
      : 'REVISE_ANALYSIS';

    const response = {
      success: true,
      gpt5: gpt5Result,
      gemini: geminiResult,
      claude: claudeResult,
      consensus: {
        average_score: avgScore,
        max_score_difference: maxDiff,
        agreement_level: agreementLevel,
        unanimous_approval: unanimousApproval,
        all_scores_at_100: allScoresAt100,
      },
      verdict,
      timestamp: new Date().toISOString(),
    };

    console.log(`[triple-verify] Verdict: ${verdict} (avg score: ${avgScore})`);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[triple-verify] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function verifyWithGPT5(prompt: string) {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
        messages: [
          {
            role: 'system',
            content: 'You are a senior technical auditor. Output valid JSON only with: overall_score (0-100), confidence_level (high/medium/low), verified_findings (array of {finding, verified, severity_accurate, evidence, score}), missed_issues (array of strings), incorrect_assumptions (array of strings), recommendation (approve/revise/reject), reasoning (string).',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error('[GPT-5] HTTP error:', response.status, response.statusText);
      throw new Error(`GPT-5 API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[GPT-5] Response structure:', JSON.stringify(data).substring(0, 200));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('[GPT-5] Invalid response structure:', JSON.stringify(data));
      throw new Error('Invalid GPT-5 response structure');
    }

    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('[GPT-5] JSON parse error:', parseError);
      // If not valid JSON, create structured response
      return {
        overall_score: 70,
        confidence_level: 'medium',
        verified_findings: [],
        missed_issues: ['Model response was not valid JSON'],
        incorrect_assumptions: [],
        recommendation: 'revise',
        reasoning: content || 'No content returned',
      };
    }
  } catch (error) {
    console.error('[GPT-5] Verification error:', error);
    return {
      overall_score: 50,
      confidence_level: 'low',
      verified_findings: [],
      missed_issues: [`GPT-5 verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      incorrect_assumptions: [],
      recommendation: 'revise',
      reasoning: 'GPT-5 verification could not complete due to technical error',
    };
  }
}

async function verifyWithGemini(prompt: string) {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a senior technical auditor. Output valid JSON only with: overall_score (0-100), confidence_level (high/medium/low), verified_findings (array of {finding, verified, severity_accurate, evidence, score}), missed_issues (array of strings), incorrect_assumptions (array of strings), recommendation (approve/revise/reject), reasoning (string).',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('[Gemini] HTTP error:', response.status, response.statusText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    // Read the full response text first
    const responseText = await response.text();
    console.log('[Gemini] Raw response length:', responseText.length);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('[Gemini] Failed to parse response as JSON:', e);
      console.error('[Gemini] Response text:', responseText.substring(0, 500));
      throw new Error('Gemini returned invalid JSON response');
    }
    
    console.log('[Gemini] Response structure:', JSON.stringify(data).substring(0, 200));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('[Gemini] Invalid response structure:', JSON.stringify(data));
      throw new Error('Invalid Gemini response structure');
    }

    let content = data.choices[0].message.content;
    
    // Strip markdown code blocks if present (Gemini often wraps JSON in ```json ... ```)
    if (content.includes('```')) {
      content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    }
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('[Gemini] JSON parse error:', parseError);
      console.error('[Gemini] Content that failed to parse:', content.substring(0, 500));
      return {
        overall_score: 70,
        confidence_level: 'medium',
        verified_findings: [],
        missed_issues: ['Model response was not valid JSON'],
        incorrect_assumptions: [],
        recommendation: 'revise',
        reasoning: content || 'No content returned',
      };
    }
  } catch (error) {
    console.error('[Gemini] Verification error:', error);
    return {
      overall_score: 50,
      confidence_level: 'low',
      verified_findings: [],
      missed_issues: [`Gemini verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      incorrect_assumptions: [],
      recommendation: 'revise',
      reasoning: 'Gemini verification could not complete due to technical error',
    };
  }
}

async function verifyWithClaude(prompt: string) {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 4096,
        system: 'You are a senior technical auditor. Output valid JSON only with: overall_score (0-100), confidence_level (high/medium/low), verified_findings (array of {finding, verified, severity_accurate, evidence, score}), missed_issues (array of strings), incorrect_assumptions (array of strings), recommendation (approve/revise/reject), reasoning (string).',
        messages: [
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error('[Claude] HTTP error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('[Claude] Error response:', errorText);
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Claude] Response structure:', JSON.stringify(data).substring(0, 200));
    
    if (!data.content || !data.content[0] || !data.content[0].text) {
      console.error('[Claude] Invalid response structure:', JSON.stringify(data));
      throw new Error('Invalid Claude response structure');
    }

    let content = data.content[0].text;
    
    // Strip markdown code blocks if present
    if (content.includes('```')) {
      content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    }
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('[Claude] JSON parse error:', parseError);
      console.error('[Claude] Content that failed to parse:', content.substring(0, 500));
      return {
        overall_score: 70,
        confidence_level: 'medium',
        verified_findings: [],
        missed_issues: ['Model response was not valid JSON'],
        incorrect_assumptions: [],
        recommendation: 'revise',
        reasoning: content || 'No content returned',
      };
    }
  } catch (error) {
    console.error('[Claude] Verification error:', error);
    return {
      overall_score: 50,
      confidence_level: 'low',
      verified_findings: [],
      missed_issues: [`Claude verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
      incorrect_assumptions: [],
      recommendation: 'revise',
      reasoning: 'Claude verification could not complete due to technical error',
    };
  }
}
