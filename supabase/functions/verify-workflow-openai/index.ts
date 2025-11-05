import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FileToVerify {
  fileName: string;
  fileContent: string;
  category: 'core' | 'state' | 'security' | 'ui' | 'worker';
}

interface VerificationRequest {
  files: FileToVerify[];
  focusAreas: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { files, focusAreas } = await req.json() as VerificationRequest;
    
    console.log(`🔍 Starting OpenAI verification for ${files.length} files`);
    console.log(`📋 Focus areas: ${focusAreas.join(', ')}`);

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Build comprehensive context for GPT-5
    const filesContext = files.map((f, idx) => 
      `\n${'='.repeat(80)}\nFILE ${idx + 1}: ${f.fileName} (${f.category})\n${'='.repeat(80)}\n${f.fileContent}\n`
    ).join('\n');

    const systemPrompt = `You are a principal engineer and architect conducting a COMPREHENSIVE HARDENED VERIFICATION of a Polish Citizenship portal's Documents Workflow system.

Your mission is to perform an EXHAUSTIVE multi-dimensional analysis:

## 🔒 SECURITY & COMPLIANCE (CRITICAL)
- PII exposure, leakage, and logging risks
- Authentication and authorization gaps
- SQL injection, XSS, CSRF vulnerabilities
- Hardcoded secrets and API keys
- RLS (Row Level Security) bypass risks
- Input validation and sanitization weaknesses
- GDPR/CCPA compliance gaps
- Consent management before AI processing
- Data encryption in transit and at rest
- Session management vulnerabilities

## 🏗️ ARCHITECTURE & DESIGN
- Component coupling and cohesion
- Separation of concerns
- Design pattern usage and correctness
- State management architecture
- Data flow and control flow clarity
- Scalability of architectural decisions
- Technical debt accumulation
- Code reusability and maintainability
- Dependency injection and testability
- Module boundaries and interfaces

## ⚡ PERFORMANCE & SCALABILITY
- Memory leaks and resource management
- Inefficient algorithms or queries
- N+1 query problems
- Unnecessary re-renders or computations
- Bundle size and code splitting
- Lazy loading opportunities
- Caching strategies
- Database query optimization
- Network request batching effectiveness
- Worker thread usage efficiency

## 🛡️ RELIABILITY & ROBUSTNESS
- State management race conditions
- Concurrent request handling
- Transaction isolation and atomicity
- Deadlock and livelock scenarios
- Data corruption risks
- Idempotency of operations
- Retry logic and exponential backoff
- Circuit breaker patterns
- Graceful degradation
- Fault tolerance mechanisms

## 🔥 ERROR HANDLING & RECOVERY
- Unhandled exceptions and promise rejections
- Missing null/undefined checks
- Network failure scenarios
- Timeout handling
- Partial failure recovery
- Error boundary implementation
- User-facing error messages
- Error logging and tracking
- Rollback and compensation logic
- Data consistency after failures

## 👤 USER EXPERIENCE & WORKFLOW
- Workflow step clarity and intuition
- User feedback during operations
- Loading and progress indicators
- Error message clarity
- Accessibility (a11y) compliance
- Responsive design implementation
- Keyboard navigation support
- Screen reader compatibility
- Mobile/tablet usability
- Workflow interruption handling

## 🧪 TESTING & QUALITY
- Test coverage gaps
- Integration test needs
- End-to-end test scenarios
- Edge case identification
- Mock and stub quality
- Test maintainability
- Performance test requirements
- Load testing considerations
- Chaos engineering opportunities

## 📊 OBSERVABILITY & DEBUGGING
- Logging completeness and quality
- Metrics and KPI tracking
- Error tracking integration
- Performance monitoring
- User analytics
- Debug information availability
- Audit trail completeness
- Troubleshooting documentation

## 🔄 WORKFLOW CORRECTNESS
- State machine transitions
- Business logic correctness
- Data transformation accuracy
- Validation logic completeness
- Edge case handling
- Rollback and undo functionality
- Progress persistence
- Recovery from interruptions
- Multi-user concurrency handling

## 📝 CODE QUALITY & MAINTAINABILITY
- Code clarity and readability
- Naming conventions
- Comment quality and necessity
- Function complexity (cyclomatic)
- Code duplication
- Magic numbers and strings
- TypeScript type safety
- Dead code elimination
- Consistent coding style

For EACH dimension, provide:

### PER-FILE ANALYSIS
1. **CRITICAL ISSUES** - Blockers that prevent production deployment
2. **HIGH SEVERITY** - Must fix before launch
3. **MEDIUM SEVERITY** - Should fix for quality/maintainability
4. **LOW SEVERITY** - Nice to have improvements

### CROSS-CUTTING CONCERNS
- Issues spanning multiple files
- Integration problems
- Architectural misalignments
- Workflow flow problems

### WORKFLOW VALIDATION
- Does the workflow actually work correctly?
- Are all edge cases handled?
- Can users recover from errors?
- Is data preserved across interruptions?

### RECOMMENDATIONS
- Specific, actionable improvements
- Priority-ranked
- With implementation guidance

Return response as VALID JSON:
{
  "overallAssessment": {
    "productionReady": boolean,
    "overallScore": number, // 0-100
    "confidenceLevel": "HIGH" | "MEDIUM" | "LOW",
    "executiveSummary": "3-4 sentence summary of entire analysis"
  },
  "criticalFindings": {
    "blockersCount": number,
    "securityIssues": number,
    "reliabilityIssues": number,
    "dataIntegrityIssues": number,
    "mustFixBeforeLaunch": [
      {
        "title": "Critical issue title",
        "category": "SECURITY" | "RELIABILITY" | "DATA_INTEGRITY" | "COMPLIANCE" | "ARCHITECTURE",
        "severity": "CRITICAL",
        "affectedFiles": ["file1.tsx"],
        "description": "Detailed description with impact",
        "exploitScenario": "How this fails in production",
        "businessImpact": "What this means for the business",
        "remediation": "Detailed fix with code examples"
      }
    ]
  },
  "fileAnalysis": [
    {
      "fileName": "exact-file-name.tsx",
      "overallScore": number, // 0-100
      "category": "core" | "state" | "security" | "ui" | "worker",
      "strengths": ["What this file does well"],
      "weaknesses": ["What needs improvement"],
      "criticalIssues": [
        {
          "title": "Issue title",
          "severity": "CRITICAL",
          "dimension": "SECURITY" | "ARCHITECTURE" | "PERFORMANCE" | "RELIABILITY" | "UX" | "QUALITY",
          "description": "What's wrong and why it matters",
          "impact": "Production consequences",
          "codePattern": "Specific code or pattern",
          "remediation": "How to fix with examples"
        }
      ],
      "highPriorityIssues": [ /* same structure */ ],
      "mediumPriorityIssues": [ /* same structure */ ],
      "recommendations": [
        {
          "priority": "HIGH" | "MEDIUM" | "LOW",
          "title": "Recommendation title",
          "description": "What to do",
          "benefit": "Why this helps",
          "effort": "How much work"
        }
      ]
    }
  ],
  "workflowValidation": {
    "workflowCorrectness": {
      "score": number, // 0-100
      "stateTransitionsValid": boolean,
      "edgeCasesHandled": boolean,
      "recoveryMechanisms": boolean,
      "dataConsistency": boolean,
      "issues": [
        {
          "scenario": "Specific user scenario",
          "problem": "What breaks",
          "severity": "CRITICAL" | "HIGH" | "MEDIUM",
          "fix": "How to handle correctly"
        }
      ]
    },
    "userExperience": {
      "score": number, // 0-100
      "loadingFeedback": "GOOD" | "NEEDS_IMPROVEMENT" | "POOR",
      "errorMessaging": "GOOD" | "NEEDS_IMPROVEMENT" | "POOR",
      "progressVisibility": "GOOD" | "NEEDS_IMPROVEMENT" | "POOR",
      "accessibility": "GOOD" | "NEEDS_IMPROVEMENT" | "POOR",
      "issues": ["Specific UX problems"]
    },
    "endToEndFlow": {
      "score": number, // 0-100
      "canComplete": boolean,
      "interruptionHandling": "GOOD" | "NEEDS_IMPROVEMENT" | "POOR",
      "errorRecovery": "GOOD" | "NEEDS_IMPROVEMENT" | "POOR",
      "issues": ["Problems in complete workflow"]
    }
  },
  "architectureAssessment": {
    "score": number, // 0-100
    "designPatterns": "GOOD" | "NEEDS_IMPROVEMENT" | "POOR",
    "separation": "GOOD" | "NEEDS_IMPROVEMENT" | "POOR",
    "scalability": "GOOD" | "NEEDS_IMPROVEMENT" | "POOR",
    "maintainability": "GOOD" | "NEEDS_IMPROVEMENT" | "POOR",
    "concerns": [
      {
        "area": "Specific architectural area",
        "issue": "What's problematic",
        "impact": "Long-term consequences",
        "refactoring": "How to improve"
      }
    ]
  },
  "performanceAnalysis": {
    "score": number, // 0-100
    "memoryEfficiency": "GOOD" | "NEEDS_IMPROVEMENT" | "POOR",
    "algorithmicEfficiency": "GOOD" | "NEEDS_IMPROVEMENT" | "POOR",
    "networkEfficiency": "GOOD" | "NEEDS_IMPROVEMENT" | "POOR",
    "bottlenecks": [
      {
        "location": "File and function",
        "issue": "What's slow",
        "impact": "Performance cost",
        "optimization": "How to speed up"
      }
    ]
  },
  "reliabilityAssessment": {
    "score": number, // 0-100
    "errorHandling": "GOOD" | "NEEDS_IMPROVEMENT" | "POOR",
    "raceConditionRisk": "LOW" | "MEDIUM" | "HIGH",
    "dataCorruptionRisk": "LOW" | "MEDIUM" | "HIGH",
    "recoveryMechanisms": "GOOD" | "NEEDS_IMPROVEMENT" | "POOR",
    "concerns": ["Specific reliability issues"]
  },
  "securityAssessment": {
    "score": number, // 0-100
    "piiHandling": "SECURE" | "NEEDS_IMPROVEMENT" | "VULNERABLE",
    "authentication": "SECURE" | "NEEDS_IMPROVEMENT" | "VULNERABLE",
    "inputValidation": "SECURE" | "NEEDS_IMPROVEMENT" | "VULNERABLE",
    "compliance": "COMPLIANT" | "GAPS" | "NON_COMPLIANT",
    "vulnerabilities": [ /* detailed security issues */ ]
  },
  "complianceGaps": [
    {
      "regulation": "GDPR" | "CCPA" | "Best Practice",
      "requirement": "What's required",
      "currentState": "What you have now",
      "gap": "What's missing",
      "remediation": "How to comply",
      "priority": "CRITICAL" | "HIGH" | "MEDIUM"
    }
  ],
  "crossFileIssues": [
    {
      "title": "Issue spanning files",
      "affectedFiles": ["file1.tsx", "file2.ts"],
      "category": "INTEGRATION" | "STATE_SHARING" | "DATA_FLOW" | "ERROR_PROPAGATION",
      "severity": "CRITICAL" | "HIGH" | "MEDIUM",
      "description": "What's wrong",
      "impact": "How it affects workflow",
      "remediation": "Coordinated fix across files"
    }
  ],
  "testingGaps": {
    "missingTests": [
      "Critical scenario not tested"
    ],
    "integrationTestNeeds": [
      "Integration scenario to test"
    ],
    "e2eTestScenarios": [
      "End-to-end scenario to validate"
    ]
  },
  "actionPlan": {
    "immediate": [
      {
        "action": "What to do now",
        "reason": "Why it's urgent",
        "effort": "Time estimate"
      }
    ],
    "shortTerm": [ /* same structure */ ],
    "longTerm": [ /* same structure */ ]
  }
}`;

    const userPrompt = `Perform COMPREHENSIVE HARDENED VERIFICATION on the Documents Workflow system.

This is a PRODUCTION system handling sensitive Polish citizenship documents and personal data.

ANALYSIS DIMENSIONS: ${focusAreas.join(' • ')}

FILES TO ANALYZE:
${filesContext}

VERIFICATION REQUIREMENTS:

1. **WORKFLOW CORRECTNESS** - Does it actually work?
   - Validate state machine transitions
   - Check edge case handling
   - Verify data consistency
   - Test recovery mechanisms
   - Confirm user can complete workflow

2. **SECURITY & COMPLIANCE** - Is data protected?
   - PII exposure risks
   - Authentication gaps
   - GDPR/CCPA compliance
   - Injection vulnerabilities
   - Data encryption

3. **ARCHITECTURE** - Is it well designed?
   - Design pattern correctness
   - Component coupling
   - Scalability
   - Maintainability
   - Technical debt

4. **RELIABILITY** - Will it stay up?
   - Race conditions
   - Error handling
   - Recovery mechanisms
   - Resource leaks
   - Fault tolerance

5. **PERFORMANCE** - Is it fast enough?
   - Algorithm efficiency
   - Memory management
   - Network optimization
   - Caching strategies
   - Bundle size

6. **USER EXPERIENCE** - Can users use it?
   - Workflow clarity
   - Error messaging
   - Loading feedback
   - Accessibility
   - Mobile usability

7. **CODE QUALITY** - Is it maintainable?
   - Code clarity
   - Type safety
   - Documentation
   - Test coverage
   - Consistency

CRITICAL INSTRUCTIONS:
✅ Be EXHAUSTIVE - analyze every aspect
✅ Be SPECIFIC - cite exact code patterns and lines
✅ Be ACTIONABLE - provide clear remediation steps
✅ Be REALISTIC - consider production constraints
✅ VALIDATE THE WORKFLOW - does it actually work end-to-end?
✅ IDENTIFY GAPS - what's missing that should be there?
✅ PRIORITIZE - what MUST be fixed vs nice-to-have

Output COMPLETE JSON matching the schema. Include scores, ratings, and detailed findings for EVERY dimension.`;

    console.log('📤 Sending request to OpenAI GPT-5...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error('⏱️ Analysis timeout - exceeding 3 minutes');
      controller.abort();
    }, 180000); // 3 minute timeout (edge functions have 150s limit, be safe)

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-2025-08-07', // Use full GPT-5 for reliability
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_completion_tokens: 12000, // Reduced for faster response
          response_format: { type: "json_object" }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`✅ OpenAI responded with status: ${response.status}`);

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ OpenAI API error: ${response.status}`);
        console.error(`Error details: ${errorText.substring(0, 500)}`);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'OpenAI rate limit exceeded. Please wait a moment and try again.' 
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 401 || response.status === 403) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'OpenAI API authentication failed. Check your API key configuration.' 
            }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 400) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `OpenAI request error: ${errorText}` 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw new Error(`OpenAI API error ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const aiResponse = await response.json();
      console.log('📥 Received response from OpenAI');
      console.log(`Response has ${aiResponse.choices?.length || 0} choices`);
      console.log(`Usage: ${JSON.stringify(aiResponse.usage || {})}`);
      
      if (!aiResponse.choices?.[0]?.message?.content) {
        console.error('❌ Invalid AI response structure:', JSON.stringify(aiResponse).substring(0, 500));
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid response from OpenAI - no content returned. The model may have failed to generate a response.' 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Parse with robust error handling
      const rawContent = aiResponse.choices[0].message.content;
      let verificationResult;

      try {
        verificationResult = JSON.parse(rawContent);
        console.log('✅ JSON parsed successfully');
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('Raw content preview:', rawContent.substring(0, 500));
        
        // Try to extract JSON from markdown code blocks
        const jsonMatch = rawContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          try {
            verificationResult = JSON.parse(jsonMatch[1]);
            console.log('✓ JSON extracted from markdown code block');
          } catch (innerError) {
            console.error('Failed to parse extracted JSON:', innerError);
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'OpenAI returned malformed JSON. Try again or reduce the number of files.',
                rawPreview: rawContent.substring(0, 200)
              }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Failed to parse OpenAI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
              rawPreview: rawContent.substring(0, 200)
            }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Validate response structure
      if (!verificationResult.fileAnalysis || !Array.isArray(verificationResult.fileAnalysis)) {
        console.error('❌ Invalid verification result structure');
        console.error('Missing or invalid fileAnalysis array');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'OpenAI returned incomplete verification structure. The analysis may have been cut off.' 
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const blockersCount = verificationResult.criticalFindings?.blockersCount || 0;
      const overallScore = verificationResult.overallAssessment?.overallScore || 0;
      console.log(`✅ Verification complete: Score ${overallScore}/100, ${blockersCount} blockers`);

      return new Response(
        JSON.stringify({
          success: true,
          verification: verificationResult,
          metadata: {
            filesAnalyzed: files.length,
            focusAreas,
            timestamp: new Date().toISOString(),
            model: 'gpt-5-2025-08-07'
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('⏱️ Analysis timeout - exceeded 3 minute limit');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Analysis timeout - verification took too long. Try analyzing fewer files or simplify focus areas.' 
          }),
          { status: 408, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('❌ Verification function error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown verification error',
        errorType: error instanceof Error ? error.name : 'UnknownError'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
