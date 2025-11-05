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

    const systemPrompt = `You are a senior security architect and code quality expert conducting a HARDENED security audit of a Polish Citizenship portal's Documents Workflow system.

Your mission is to perform an EXHAUSTIVE analysis focusing on:

🔒 SECURITY (CRITICAL PRIORITY)
- PII exposure and leakage risks
- Authentication and authorization gaps
- SQL injection and XSS vulnerabilities
- Hardcoded secrets and API keys
- RLS (Row Level Security) bypass risks
- Input validation weaknesses
- CSRF and injection attack vectors

🛡️ DATA PROTECTION
- GDPR/CCPA compliance issues
- PII logging to console/localStorage
- Unencrypted sensitive data transmission
- Missing consent checks before AI processing
- Inadequate data minimization

⚡ RELIABILITY & RACE CONDITIONS
- State management race conditions
- Concurrent request handling issues
- Transaction isolation problems
- Resource leaks (memory, connections)
- Deadlock scenarios
- Data corruption risks

🔥 ERROR HANDLING & EDGE CASES
- Unhandled exceptions
- Missing null/undefined checks
- Network failure scenarios
- Timeout handling
- Partial failure recovery
- User error feedback

🎯 PRODUCTION READINESS
- Performance bottlenecks
- Scalability concerns
- Monitoring and observability gaps
- Rollback mechanisms
- Circuit breaker patterns
- Rate limiting effectiveness

For EACH file analyzed, provide:

1. **CRITICAL VULNERABILITIES** (Severity: CRITICAL)
   - Must include exploit scenario
   - Must include impact assessment (data breach, system crash, etc.)
   - Must include precise line references or code patterns
   - Must provide detailed remediation steps

2. **HIGH-RISK ISSUES** (Severity: HIGH)
   - Security-relevant but not immediately exploitable
   - Data integrity risks
   - Reliability concerns in production

3. **ARCHITECTURAL CONCERNS** (Severity: MEDIUM)
   - Design patterns that could lead to future issues
   - Technical debt that impacts security/reliability
   - Missing best practices

4. **CODE QUALITY** (Severity: LOW)
   - Maintainability issues
   - Performance optimizations
   - Documentation gaps

Return response as VALID JSON:
{
  "overallRisk": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "productionReady": boolean,
  "blockersCount": number,
  "summary": "2-3 sentence executive summary",
  "fileAnalysis": [
    {
      "fileName": "exact-file-name.tsx",
      "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
      "criticalVulnerabilities": [
        {
          "title": "Vulnerability title",
          "severity": "CRITICAL",
          "category": "PII_LEAK" | "AUTH_BYPASS" | "INJECTION" | "RACE_CONDITION" | "DATA_LOSS",
          "description": "Detailed description with exploit scenario",
          "impact": "What happens if exploited",
          "codePattern": "Specific code pattern or line reference",
          "remediation": "Step-by-step fix instructions"
        }
      ],
      "highRiskIssues": [ /* same structure as above */ ],
      "recommendations": [
        "Specific actionable recommendation"
      ]
    }
  ],
  "crossFileIssues": [
    {
      "title": "Issue spanning multiple files",
      "affectedFiles": ["file1.tsx", "file2.ts"],
      "severity": "CRITICAL" | "HIGH",
      "description": "Detailed description",
      "remediation": "How to fix across files"
    }
  ],
  "complianceGaps": [
    {
      "regulation": "GDPR" | "CCPA" | "Security Best Practice",
      "violation": "What's missing",
      "remediation": "How to comply"
    }
  ]
}`;

    const userPrompt = `Perform HARDENED security verification on the Documents Workflow system.

FOCUS AREAS: ${focusAreas.join(', ')}

FILES TO ANALYZE:
${filesContext}

CRITICAL: Be THOROUGH and SPECIFIC. Include:
- Exact code patterns causing issues
- Step-by-step exploit scenarios for vulnerabilities
- Detailed remediation with code examples
- Cross-file dependencies and interaction issues
- Production deployment risks

Identify ALL issues, even minor ones. This is a PRODUCTION system handling sensitive Polish citizenship documents and personal data.`;

    console.log('📤 Sending request to OpenAI GPT-5...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minute timeout for thorough analysis

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-5-2025-08-07',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_completion_tokens: 16000, // GPT-5 uses max_completion_tokens
          response_format: { type: "json_object" }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ OpenAI API error:', response.status, errorText);
        
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        if (response.status === 401) {
          throw new Error('Invalid OpenAI API key. Please check your configuration.');
        }
        
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const aiResponse = await response.json();
      console.log('📥 Received response from OpenAI');
      
      if (!aiResponse.choices?.[0]?.message?.content) {
        console.error('❌ Invalid AI response structure:', aiResponse);
        throw new Error('Invalid response from OpenAI - no content returned');
      }

      // Parse with robust error handling
      const rawContent = aiResponse.choices[0].message.content;
      let verificationResult;

      try {
        verificationResult = JSON.parse(rawContent);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        
        // Try to extract JSON from markdown code blocks
        const jsonMatch = rawContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          verificationResult = JSON.parse(jsonMatch[1]);
          console.log('✓ JSON extracted from code block');
        } else {
          throw new Error(`Failed to parse OpenAI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
        }
      }

      // Validate response structure
      if (!verificationResult.fileAnalysis || !Array.isArray(verificationResult.fileAnalysis)) {
        console.error('❌ Invalid verification result structure');
        throw new Error('OpenAI returned invalid verification structure');
      }

      console.log(`✅ Verification complete: ${verificationResult.overallRisk} risk, ${verificationResult.blockersCount} blockers`);

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
        throw new Error('Request timeout - analysis took too long (>3 minutes)');
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('❌ Verification error:', error);
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
