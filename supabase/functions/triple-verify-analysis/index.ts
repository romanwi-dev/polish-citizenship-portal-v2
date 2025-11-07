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
    const { analysis, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('🔍 Starting Triple-Model Verification...');

    const verificationPrompt = `You are a senior software architect reviewing a technical analysis. 

CONTEXT:
${context}

PHASE A ANALYSIS TO VERIFY:
${analysis}

YOUR TASK:
1. Review the Phase A analysis for accuracy, completeness, and risk assessment
2. Identify any incorrect assumptions, missed issues, or overstatements
3. Verify each finding with evidence-based reasoning
4. Rate the overall analysis quality on a scale of 0-100

CRITICAL EVALUATION CRITERIA:
- Are the identified issues actually present in the codebase?
- Is the severity assessment accurate?
- Are there missed critical issues?
- Is the proposed solution appropriate?
- Are there any incorrect assumptions?

Provide your response in this JSON format:
{
  "overall_score": <0-100>,
  "confidence_level": "<high|medium|low>",
  "verified_findings": [
    {
      "finding": "<finding name>",
      "verified": <true|false>,
      "severity_accurate": <true|false>,
      "evidence": "<your evidence>",
      "score": <0-100>
    }
  ],
  "missed_issues": ["<any critical issues the analysis missed>"],
  "incorrect_assumptions": ["<any wrong assumptions made>"],
  "recommendation": "<approve|revise|reject>",
  "reasoning": "<detailed explanation of your verdict>"
}`;

    // Call GPT-5
    console.log('📤 Calling GPT-5...');
    const gpt5Response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
            content: 'You are a senior software architect with expertise in React, TypeScript, and database systems. You provide rigorous, evidence-based code reviews.'
          },
          {
            role: 'user',
            content: verificationPrompt
          }
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!gpt5Response.ok) {
      const error = await gpt5Response.text();
      console.error('❌ GPT-5 error:', gpt5Response.status, error);
      throw new Error(`GPT-5 API error: ${gpt5Response.status}`);
    }

    const gpt5Data = await gpt5Response.json();
    const gpt5Result = JSON.parse(gpt5Data.choices[0].message.content);
    console.log('✅ GPT-5 verification complete:', gpt5Result.overall_score);

    // Call Gemini 2.5 Pro
    console.log('📤 Calling Gemini 2.5 Pro...');
    const geminiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: 'You are a senior software architect with expertise in React, TypeScript, and database systems. You provide rigorous, evidence-based code reviews.'
          },
          {
            role: 'user',
            content: verificationPrompt
          }
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!geminiResponse.ok) {
      const error = await geminiResponse.text();
      console.error('❌ Gemini error:', geminiResponse.status, error);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    const geminiResult = JSON.parse(geminiData.choices[0].message.content);
    console.log('✅ Gemini verification complete:', geminiResult.overall_score);

    // Calculate consensus
    const averageScore = (gpt5Result.overall_score + geminiResult.overall_score) / 2;
    const scoreDifference = Math.abs(gpt5Result.overall_score - geminiResult.overall_score);
    
    const consensus = {
      average_score: averageScore,
      score_difference: scoreDifference,
      agreement_level: scoreDifference < 10 ? 'high' : scoreDifference < 25 ? 'medium' : 'low',
      unanimous_approval: gpt5Result.recommendation === 'approve' && geminiResult.recommendation === 'approve',
      all_scores_above_80: gpt5Result.overall_score >= 80 && geminiResult.overall_score >= 80,
    };

    console.log('📊 Verification Summary:');
    console.log('  GPT-5 Score:', gpt5Result.overall_score, '- Recommendation:', gpt5Result.recommendation);
    console.log('  Gemini Score:', geminiResult.overall_score, '- Recommendation:', geminiResult.recommendation);
    console.log('  Consensus:', consensus);

    return new Response(
      JSON.stringify({
        success: true,
        gpt5: gpt5Result,
        gemini: geminiResult,
        consensus,
        verdict: consensus.all_scores_above_80 && consensus.unanimous_approval 
          ? 'PROCEED_TO_EX' 
          : 'REVISE_ANALYSIS',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Triple verification error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
