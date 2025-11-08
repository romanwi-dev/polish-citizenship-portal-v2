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
    const { analysis } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const verificationPrompt = `You are a senior software architect reviewing a technical analysis of a PDF generation system bug.

**YOUR TASK**: Critically evaluate this Phase A analysis for accuracy, completeness, and solution viability.

**ANALYSIS TO REVIEW**:
${analysis}

**EVALUATION CRITERIA**:
1. **Root Cause Accuracy** (30 points): Is the identified root cause correct and complete?
2. **Solution Architecture** (25 points): Is the proposed solution technically sound?
3. **Risk Assessment** (20 points): Are risks properly identified and mitigated?
4. **Implementation Plan** (15 points): Is the plan realistic and actionable?
5. **Missing Considerations** (10 points): What critical aspects were overlooked?

**OUTPUT FORMAT**:
Provide a JSON response with this structure:
{
  "score": <number 0-100>,
  "strengths": ["list of what's correct"],
  "concerns": ["list of issues or gaps"],
  "critical_issues": ["blocking problems that prevent approval"],
  "recommendations": ["specific improvements needed"],
  "verdict": "APPROVED" or "REJECTED",
  "reasoning": "detailed explanation of your assessment"
}

**SCORING GUIDELINES**:
- 95-100: Excellent, ready for implementation
- 85-94: Good with minor improvements needed
- 70-84: Acceptable but has significant gaps
- 50-69: Major issues, needs substantial revision
- <50: Fundamentally flawed, restart analysis

Be thorough, critical, and specific. Focus on technical accuracy.`;

    console.log('[Verify] Starting triple-model verification...');

    // Model 1: OpenAI GPT-5
    console.log('[Verify] Calling GPT-5...');
    const gpt5Response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
        messages: [
          { role: 'system', content: 'You are a senior software architect specializing in debugging complex systems.' },
          { role: 'user', content: verificationPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!gpt5Response.ok) {
      const error = await gpt5Response.text();
      console.error('[Verify] GPT-5 error:', error);
      throw new Error(`GPT-5 failed: ${error}`);
    }

    const gpt5Data = await gpt5Response.json();
    const gpt5Result = JSON.parse(gpt5Data.choices[0].message.content);
    console.log('[Verify] GPT-5 score:', gpt5Result.score);

    // Model 2: Google Gemini 2.5 Pro
    console.log('[Verify] Calling Gemini 2.5 Pro...');
    const geminiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: 'You are a senior software architect specializing in debugging complex systems.' },
          { role: 'user', content: verificationPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!geminiResponse.ok) {
      const error = await geminiResponse.text();
      console.error('[Verify] Gemini error:', error);
      throw new Error(`Gemini failed: ${error}`);
    }

    const geminiData = await geminiResponse.json();
    const geminiResult = JSON.parse(geminiData.choices[0].message.content);
    console.log('[Verify] Gemini score:', geminiResult.score);

    // Model 3: Google Gemini 2.5 Flash (as proxy for Claude - Lovable AI doesn't support Claude)
    console.log('[Verify] Calling Gemini 2.5 Flash (technical review)...');
    const flashResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a senior software architect with expertise in edge case analysis and implementation risks.' },
          { role: 'user', content: verificationPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!flashResponse.ok) {
      const error = await flashResponse.text();
      console.error('[Verify] Flash error:', error);
      throw new Error(`Flash failed: ${error}`);
    }

    const flashData = await flashResponse.json();
    const flashResult = JSON.parse(flashData.choices[0].message.content);
    console.log('[Verify] Gemini Flash score:', flashResult.score);

    // Calculate results
    const averageScore = (gpt5Result.score + geminiResult.score + flashResult.score) / 3;
    const allApproved = gpt5Result.verdict === 'APPROVED' && 
                        geminiResult.verdict === 'APPROVED' && 
                        flashResult.verdict === 'APPROVED';
    const passesThreshold = averageScore >= 95 && allApproved;

    console.log('[Verify] Average score:', averageScore);
    console.log('[Verify] All approved:', allApproved);
    console.log('[Verify] Passes threshold:', passesThreshold);

    return new Response(
      JSON.stringify({
        success: true,
        verification: {
          averageScore: Math.round(averageScore * 100) / 100,
          passesThreshold,
          allApproved,
          models: {
            gpt5: gpt5Result,
            gemini_pro: geminiResult,
            gemini_flash: flashResult,
          },
          conclusion: passesThreshold 
            ? 'PHASE B PASSED - Ready for Phase EX (Execution)' 
            : 'PHASE B FAILED - Return to Phase A for corrections',
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('[Verify] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});