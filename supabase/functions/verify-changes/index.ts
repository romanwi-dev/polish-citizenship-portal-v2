import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChangeProposal {
  type: 'database' | 'edge_function' | 'frontend' | 'mixed';
  description: string;
  impact: string;
  files: Array<{
    path: string;
    action: 'edit' | 'create' | 'delete';
    changes: string;
    linesAffected?: string;
  }>;
  sql?: string[];
  edgeFunctions?: Array<{
    name: string;
    changes: string;
  }>;
  reasoning: string;
  risks: string[];
  rollbackPlan: string;
}

interface VerificationResult {
  approved: boolean;
  overallScore: number;
  scores: {
    logic: { score: number; issues: string[] };
    security: { score: number; issues: string[] };
    database: { score: number; issues: string[] };
    codeQuality: { score: number; issues: string[] };
    performance: { score: number; issues: string[] };
    bestPractices: { score: number; issues: string[] };
  };
  criticalIssues: string[];
  warnings: string[];
  suggestions: string[];
  recommendation: 'approve' | 'approve_with_changes' | 'reject';
  explanation: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { proposal } = await req.json() as { proposal: ChangeProposal };

    if (!proposal) {
      return new Response(
        JSON.stringify({ error: 'Missing change proposal' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('🔍 Sending proposal to OpenAI for verification...');
    console.log('Type:', proposal.type);
    console.log('Files affected:', proposal.files.length);

    const systemPrompt = `You are an expert code reviewer for a Polish Citizenship Portal built with:

TECHNOLOGY STACK:
- Frontend: React + TypeScript + Vite + TanStack Query + React Hook Form
- Backend: Supabase (PostgreSQL + Edge Functions in Deno/TypeScript)
- Auth: Supabase Auth with user_roles table using has_role() function
- State Management: TanStack Query for server state, React Hook Form for forms
- UI: Radix UI + Tailwind CSS with semantic design tokens

YOUR JOB:
Review proposed code changes and evaluate across 6 dimensions:

1. LOGIC CORRECTNESS (0-10)
   - Are the changes logically sound?
   - Will they solve the stated problem?
   - Any flawed assumptions?
   - Edge cases considered?

2. SECURITY (0-10)
   - RLS policies correct and sufficient?
   - Data exposure risks?
   - Auth vulnerabilities?
   - Input sanitization?
   - SQL injection risks?

3. DATABASE SCHEMA (0-10)
   - Column types appropriate?
   - Foreign keys valid?
   - Indexes needed?
   - Migrations safe (no data loss)?
   - Naming conventions followed?

4. CODE QUALITY (0-10)
   - TypeScript types correct and complete?
   - Error handling comprehensive?
   - Code maintainable and readable?
   - Proper async/await usage?
   - Edge cases handled?

5. PERFORMANCE (0-10)
   - Query efficiency (N+1 problems)?
   - Unnecessary re-renders?
   - Proper memoization?
   - Bundle size impact?
   - Database indexes needed?

6. BEST PRACTICES (0-10)
   - Follows Supabase patterns?
   - React best practices?
   - Proper form validation?
   - Accessibility considerations?
   - Error messages user-friendly?

EVALUATION CRITERIA:
- Score each dimension 0-10 (10 = perfect)
- Identify CRITICAL issues (must fix before implementation)
- Identify WARNINGS (should fix, may cause problems)
- Provide SUGGESTIONS (nice to have, optional improvements)
- Make final recommendation: approve | approve_with_changes | reject

BE SPECIFIC:
- Reference exact file paths and line numbers when possible
- Quote problematic code snippets
- Suggest concrete fixes with code examples
- Explain WHY something is an issue, not just WHAT
- Consider the project context (Polish citizenship process)

OUTPUT FORMAT:
You MUST respond with valid JSON matching this exact structure:
{
  "approved": boolean,
  "overallScore": number (0-10),
  "scores": {
    "logic": { "score": number, "issues": string[] },
    "security": { "score": number, "issues": string[] },
    "database": { "score": number, "issues": string[] },
    "codeQuality": { "score": number, "issues": string[] },
    "performance": { "score": number, "issues": string[] },
    "bestPractices": { "score": number, "issues": string[] }
  },
  "criticalIssues": string[],
  "warnings": string[],
  "suggestions": string[],
  "recommendation": "approve" | "approve_with_changes" | "reject",
  "explanation": "Brief summary of the review"
}`;

    const userPrompt = `Review this change proposal:

TYPE: ${proposal.type}
DESCRIPTION: ${proposal.description}
IMPACT: ${proposal.impact}

FILES TO CHANGE:
${proposal.files.map(f => `
- ${f.path} (${f.action})
  Changes: ${f.changes}
  ${f.linesAffected ? `Lines: ${f.linesAffected}` : ''}
`).join('\n')}

${proposal.sql && proposal.sql.length > 0 ? `
SQL CHANGES:
${proposal.sql.map(s => `- ${s}`).join('\n')}
` : ''}

${proposal.edgeFunctions && proposal.edgeFunctions.length > 0 ? `
EDGE FUNCTIONS:
${proposal.edgeFunctions.map(ef => `
- ${ef.name}
  Changes: ${ef.changes}
`).join('\n')}
` : ''}

REASONING: ${proposal.reasoning}

IDENTIFIED RISKS:
${proposal.risks.map(r => `- ${r}`).join('\n')}

ROLLBACK PLAN: ${proposal.rollbackPlan}

Provide a thorough review in the specified JSON format.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_completion_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ OpenAI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Payment required. Please add credits to your Lovable workspace.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const reviewText = data.choices[0].message.content;

    console.log('✅ Received OpenAI review');

    // Parse the JSON response
    let review: VerificationResult;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = reviewText.match(/```json\n([\s\S]*?)\n```/) || reviewText.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : reviewText;
      review = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('❌ Failed to parse OpenAI response as JSON:', parseError);
      console.error('Raw response:', reviewText);
      
      // Fallback: Create a basic review structure
      review = {
        approved: false,
        overallScore: 5,
        scores: {
          logic: { score: 5, issues: [] },
          security: { score: 5, issues: [] },
          database: { score: 5, issues: [] },
          codeQuality: { score: 5, issues: [] },
          performance: { score: 5, issues: [] },
          bestPractices: { score: 5, issues: [] },
        },
        criticalIssues: ['Failed to parse AI review - manual review required'],
        warnings: [],
        suggestions: [],
        recommendation: 'reject',
        explanation: 'AI review parsing failed. Raw response: ' + reviewText.substring(0, 500),
      };
    }

    console.log('📊 Review summary:', {
      approved: review.approved,
      overallScore: review.overallScore,
      recommendation: review.recommendation,
      criticalIssues: review.criticalIssues.length,
      warnings: review.warnings.length,
    });

    return new Response(
      JSON.stringify({
        success: true,
        proposal,
        review,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Error in verify-changes function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
