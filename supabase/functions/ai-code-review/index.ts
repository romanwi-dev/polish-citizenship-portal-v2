import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CodeReviewRequest {
  fileName: string;
  fileContent: string;
  reviewType: 'correctness' | 'security' | 'performance' | 'reliability' | 'maintainability' | 'comprehensive';
}

interface ReviewCategory {
  category: string;
  score: number; // 0-20
  issues: Array<{
    line?: number;
    severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
    title: string;
    description: string;
    recommendation: string;
  }>;
  strengths: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fileName, fileContent, reviewType = 'comprehensive' } = await req.json() as CodeReviewRequest;

    if (!fileName || !fileContent) {
      throw new Error('Missing fileName or fileContent');
    }

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log(`Starting ${reviewType} code review for ${fileName}...`);

    // Comprehensive system prompt for GPT-5
    const systemPrompt = `You are a senior software architect conducting a zero-fail code review for a production Polish citizenship portal application.

Your task is to analyze the provided code file for potential issues across multiple categories.

CRITICAL INSTRUCTIONS:
1. You MUST return valid JSON only - no markdown, no code blocks, no explanations outside JSON
2. Be extremely thorough and identify ALL potential issues, no matter how minor
3. For each issue, provide specific line numbers when possible
4. Rate severity accurately: CRITICAL = production breaking, HIGH = major bug risk, MEDIUM = code smell, LOW = minor improvement, INFO = suggestion
5. Provide actionable recommendations with code examples when relevant

Return a JSON object with this EXACT structure:
{
  "overallScore": number (0-100),
  "categories": [
    {
      "category": "Correctness" | "Security" | "Performance" | "Reliability" | "Maintainability",
      "score": number (0-20),
      "issues": [
        {
          "line": number | null,
          "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO",
          "title": "Brief issue title",
          "description": "Detailed explanation of the problem",
          "recommendation": "Specific fix with code example if applicable"
        }
      ],
      "strengths": ["List of good practices found in this category"]
    }
  ],
  "summary": "Executive summary of code quality and readiness",
  "blockers": ["List of CRITICAL and HIGH severity issues that must be fixed"],
  "recommendations": ["Top 3-5 improvement recommendations prioritized by impact"]
}

SCORING RUBRIC (per category, 0-20 points):
- 18-20: Excellent, production-ready
- 15-17: Good, minor improvements needed
- 12-14: Acceptable, some refactoring recommended
- 8-11: Problematic, multiple issues to fix
- 0-7: Critical issues, not production-ready

ANALYSIS FOCUS AREAS:

**Correctness (0-20):**
- Logic errors, edge cases, type safety
- Null/undefined handling
- Async/await patterns
- Error propagation
- Data validation
- API contract compliance

**Security (0-20):**
- SQL injection vectors
- XSS vulnerabilities
- Authentication bypass risks
- Data exposure in logs
- RLS policy effectiveness
- Secret management
- Input sanitization

**Performance (0-20):**
- N+1 query patterns
- Memory leaks (especially with base64 conversions)
- Blocking operations
- Unnecessary re-renders
- Missing indexes
- Batch operation opportunities

**Reliability (0-20):**
- Error handling coverage
- Retry logic
- Idempotency
- Race conditions
- Transaction boundaries
- Graceful degradation
- Timeout handling

**Maintainability (0-20):**
- Code clarity and readability
- Documentation quality
- Function complexity
- Naming conventions
- DRY principle adherence
- Testability
- Separation of concerns`;

    const userPrompt = `Review this ${reviewType === 'comprehensive' ? 'complete' : reviewType} analysis for file: **${fileName}**

\`\`\`typescript
${fileContent}
\`\`\`

Provide a comprehensive code review following the JSON structure specified in the system prompt.
Focus on production-readiness, security, and reliability.
Be thorough but practical - identify real issues that could cause problems in production.`;

    // Call GPT-5 via Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('GPT-5 API error:', error);
      throw new Error(`GPT-5 API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const reviewResult = JSON.parse(aiResponse.choices[0].message.content);

    console.log(`✓ Code review complete for ${fileName}: ${reviewResult.overallScore}/100`);
    console.log(`  Blockers: ${reviewResult.blockers?.length || 0}`);

    return new Response(
      JSON.stringify({
        success: true,
        fileName,
        reviewType,
        review: reviewResult,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Code review error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
