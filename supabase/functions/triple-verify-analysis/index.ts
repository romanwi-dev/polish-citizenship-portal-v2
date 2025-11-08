/**
 * Triple-Model Verification System for A→B→EX Protocol
 * Uses GPT-5 and Gemini 2.5 Pro for verification
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

    // Run parallel verification across models
    const [gpt5Result, geminiResult] = await Promise.all([
      verifyWithGPT5(verificationPrompt),
      verifyWithGemini(verificationPrompt),
    ]);

    // Calculate consensus
    const avgScore = (gpt5Result.overall_score + geminiResult.overall_score) / 2;
    const scoreDiff = Math.abs(gpt5Result.overall_score - geminiResult.overall_score);
    
    const unanimousApproval = 
      gpt5Result.recommendation === 'approve' && 
      geminiResult.recommendation === 'approve';
    
    const allScoresAbove80 = 
      gpt5Result.overall_score >= 80 && 
      geminiResult.overall_score >= 80;

    const agreementLevel = scoreDiff <= 10 ? 'high' : scoreDiff <= 25 ? 'medium' : 'low';
    
    const verdict = (unanimousApproval && allScoresAbove80 && agreementLevel === 'high') 
      ? 'PROCEED_TO_EX' 
      : 'REVISE_ANALYSIS';

    const response = {
      success: true,
      gpt5: gpt5Result,
      gemini: geminiResult,
      consensus: {
        average_score: avgScore,
        score_difference: scoreDiff,
        agreement_level: agreementLevel,
        unanimous_approval: unanimousApproval,
        all_scores_above_80: allScoresAbove80,
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

    const data = await response.json();
    console.log('[Gemini] Response structure:', JSON.stringify(data).substring(0, 200));
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('[Gemini] Invalid response structure:', JSON.stringify(data));
      throw new Error('Invalid Gemini response structure');
    }

    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('[Gemini] JSON parse error:', parseError);
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
