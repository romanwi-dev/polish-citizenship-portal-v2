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
    const { fileName, issue } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Get file content (simplified - in production, fetch from actual source)
    const fileContent = `// File content for ${fileName}`;

    const systemPrompt = `You are an expert code reviewer and fixer. Your task is to apply the recommended fix to the code.

CRITICAL RULES:
1. Return ONLY valid JSON with this exact structure:
{
  "success": true,
  "changes": {
    "search": "exact code to find and replace",
    "replace": "new corrected code",
    "lineStart": number,
    "lineEnd": number
  },
  "explanation": "brief explanation of what was fixed"
}

2. The "search" field must contain the EXACT code that needs to be replaced
3. The "replace" field must contain the corrected code
4. Include line numbers if available
5. Keep changes minimal and focused on the specific issue`;

    const userPrompt = `File: ${fileName}
${issue.line ? `Line: ${issue.line}` : ''}

Issue: ${issue.title}
Description: ${issue.description}
Recommendation: ${issue.recommendation}

Generate the exact code change needed to fix this issue. Return as JSON.`;

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
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse the AI response
    let fixData;
    try {
      // Try to extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      fixData = JSON.parse(jsonStr);
    } catch (e) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid response format from AI');
    }

    // In a real implementation, this would apply the changes to the actual file
    // For now, we'll return the proposed changes
    return new Response(
      JSON.stringify({
        success: true,
        changes: fixData.changes,
        explanation: fixData.explanation,
        message: 'Fix proposal generated. In production, this would be applied to the file.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in apply-quick-fix:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});