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

    const systemPrompt = `You are a security expert for a Polish Citizenship Portal built with:
- Frontend: React + TypeScript (src/ directory)
- Backend: Supabase (PostgreSQL, Edge Functions in Deno/TypeScript)
- Auth: Supabase Auth with user_roles table using has_role() function
- Files: React pages in src/pages/, components in src/components/, edge functions in supabase/functions/

Provide SPECIFIC, ACTIONABLE fixes using actual project file paths and code patterns.`

    const userPrompt = `Fix these security issues in the Polish Citizenship Portal:

${JSON.stringify(issuesSummary, null, 2)}

For EACH issue provide:

## Issue: [severity] - [category]

**Files to modify:**
- Exact file path (e.g., src/pages/admin/SecurityAudit.tsx)

**Changes needed:**
\`\`\`typescript
// Actual code snippet ready to copy-paste
\`\`\`

**SQL Migration (if needed):**
\`\`\`sql
-- Supabase migration SQL
\`\`\`

**Why this fixes it:** One sentence explanation.

---

Group by: CRITICAL → HIGH → MEDIUM → LOW
Use project patterns: has_role() for RLS, supabase.from() for queries, TypeScript for edge functions.
Be concise. No generic advice - only specific code for THIS project.`

    // Call Lovable AI to generate fix recommendations
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4000
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