import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { issues } = await req.json()
    
    if (!issues || !Array.isArray(issues)) {
      throw new Error('Invalid issues data provided')
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured')
    }

    // Prepare the security issues summary for AI
    const issuesSummary = issues.map(issue => ({
      severity: issue.severity,
      category: issue.category,
      message: issue.message,
      file: issue.file,
      recommendation: issue.recommendation
    }))

    const systemPrompt = `You are a security expert. You will receive a list of security issues found in a web application.
Your task is to provide detailed, actionable fixes for each issue. Include:
1. The specific file that needs to be modified
2. The exact changes required
3. Code snippets if applicable
4. Why the fix addresses the security concern

Format your response as a structured plan with clear steps.`

    const userPrompt = `I have the following security issues that need to be fixed:

${JSON.stringify(issuesSummary, null, 2)}

Please provide a comprehensive fix plan for all these issues. For each issue:
1. Explain what needs to be changed
2. Provide the specific code changes needed
3. Explain why this fixes the security vulnerability

Prioritize critical and high severity issues first.`

    // Call Lovable AI to generate fix recommendations
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
      }),
    })

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text()
      console.error('AI API error:', aiResponse.status, errorText)
      throw new Error(`AI API returned ${aiResponse.status}`)
    }

    const aiData = await aiResponse.json()
    const fixPlan = aiData.choices[0]?.message?.content || 'No fix plan generated'

    return new Response(
      JSON.stringify({
        success: true,
        fixPlan,
        issuesCount: issues.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})