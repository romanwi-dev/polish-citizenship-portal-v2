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

REVIEW CONTEXT:
This codebase has undergone a 3-phase improvement initiative:
- **Phase 1 (Security)**: PII audit logging, secure logging with sanitization
- **Phase 2 (Performance)**: useReducer state machines, Web Workers for base64 encoding, per-document progress tracking
- **Phase 3 (Reliability)**: Request batching (3 concurrent, 500ms delay), individual document error recovery, real-time metrics dashboards

TARGET: 100/100 production-ready score with zero blockers.

Your task is to analyze the provided code file for potential issues across multiple categories, considering how this file integrates with the larger architecture.

CRITICAL INSTRUCTIONS:
1. You MUST return valid JSON only - no markdown, no code blocks, no explanations outside JSON
2. Be extremely thorough and identify ALL potential issues, no matter how minor
3. For infrastructure files (hooks, workers, loggers), evaluate their integration patterns and reusability
4. For critical path files (workflows, edge functions), prioritize correctness and error handling
5. For each issue, provide specific line numbers when possible
6. Rate severity accurately: CRITICAL = production breaking, HIGH = major bug risk, MEDIUM = code smell, LOW = minor improvement, INFO = suggestion
7. Provide actionable recommendations with code examples when relevant

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
- State machine transitions (for hooks)

**Security (0-20):**
- SQL injection vectors
- XSS vulnerabilities
- Authentication bypass risks
- **PII handling**: Is sensitive data logged? Are audit trails present?
- **Data sanitization**: Are passport numbers, emails masked in logs?
- RLS policy effectiveness
- Secret management (LOVABLE_API_KEY usage)
- Input sanitization
- CORS configuration in edge functions

**Performance (0-20):**
- N+1 query patterns
- **Memory leaks**: Especially with base64 conversions, Web Workers
- **Main thread blocking**: Are heavy operations offloaded to workers?
- **Request batching**: Are concurrent requests properly throttled?
- Unnecessary re-renders (React hooks dependency arrays)
- Missing indexes
- Batch operation opportunities
- AbortController usage for cancellable requests

**Reliability (0-20):**
- **Error handling coverage**: Do edge functions handle 429/402 rate limits?
- **Retry logic**: Are failed documents retried or marked for manual review?
- **Idempotency**: Can operations be safely retried?
- **Race conditions**: Are state updates batched correctly (useReducer vs multiple useState)?
- Transaction boundaries
- **Graceful degradation**: Does the workflow continue if one document fails?
- Timeout handling
- Progress tracking accuracy

**Maintainability (0-20):**
- Code clarity and readability
- Documentation quality (JSDoc comments)
- Function complexity (cyclomatic complexity)
- Naming conventions (semantic, not abbreviations)
- DRY principle adherence
- **Hook composition**: Are custom hooks properly separated?
- **Testability**: Can functions be unit tested?
- Separation of concerns (UI vs logic)
- TypeScript type safety (no 'any' types)`;

    const userPrompt = `Review this ${reviewType === 'comprehensive' ? 'complete' : reviewType} analysis for file: **${fileName}**

\`\`\`typescript
${fileContent}
\`\`\`

Provide a comprehensive code review following the JSON structure specified in the system prompt.
Focus on production-readiness, security, and reliability.
Be thorough but practical - identify real issues that could cause problems in production.`;

    // Call Lovable AI with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000); // 90 second timeout
    
    let reviewResult;
    
    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          response_format: { type: "json_object" }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API error:', response.status, errorText);
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        if (response.status === 402) {
          throw new Error('AI credits exhausted. Please add credits to your Lovable workspace.');
        }
        
        throw new Error(`AI API error: ${response.status} - ${errorText}`);
      }

      const aiResponse = await response.json();
      
      if (!aiResponse.choices?.[0]?.message?.content) {
        console.error('Invalid AI response structure:', aiResponse);
        throw new Error('Invalid response from AI - no content returned');
      }

      reviewResult = JSON.parse(aiResponse.choices[0].message.content);
      
      // Validate response structure
      if (!reviewResult.overallScore || !reviewResult.categories || !Array.isArray(reviewResult.categories)) {
        console.error('Invalid review result structure:', reviewResult);
        throw new Error('AI returned invalid review structure');
      }
      
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Request timeout - file too large or AI took too long');
      }
      throw fetchError;
    }

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
