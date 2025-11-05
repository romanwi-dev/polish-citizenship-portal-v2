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
  models?: string[]; // ['openai/gpt-5', 'google/gemini-2.5-pro', 'google/gemini-2.5-flash']
}

interface ModelResult {
  model: string;
  success: boolean;
  verification?: any;
  error?: string;
  duration: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { files, focusAreas, models = ['openai/gpt-5', 'google/gemini-2.5-pro'] } = await req.json() as VerificationRequest;
    
    console.log(`🔍 Starting ZERO-FAIL multi-model verification for ${files.length} files`);
    console.log(`📋 Focus areas: ${focusAreas.join(', ')}`);
    console.log(`🤖 Models: ${models.join(', ')}`);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const filesContext = files.map((f, idx) => 
      `\n${'='.repeat(80)}\nFILE ${idx + 1}: ${f.fileName} (${f.category})\n${'='.repeat(80)}\n${f.fileContent}\n`
    ).join('\n');

    const systemPrompt = `You are a senior engineer conducting ZERO-FAIL protocol verification on a Polish Citizenship portal's Documents Workflow.

ZERO-FAIL PROTOCOL REQUIREMENTS:
- Zero bugs in deployment
- Zero iterations needed  
- Zero guessing or assumptions
- 100% success rate on first attempt

Analyze using NO-RUSH (ADCDFI) phases:
1. ANALYZE - Deep investigation of current state
2. CONSULT - Research best practices and documentation
3. DOUBLE-CHECK - Validate all assumptions
4. FIND-SOLUTION - Evaluate multiple approaches
5. FIX - Design implementation
6. IMPLEMENT - Execute with proof
7. CONFIRM - Verify deployment

Focus areas:
- Security: PII exposure, auth gaps, injection risks, GDPR compliance
- Reliability: Race conditions, error handling, data corruption, state management
- Architecture: Design patterns, coupling, scalability, maintainability
- Performance: Memory leaks, inefficient algorithms, bottlenecks
- Workflow Correctness: State transitions, edge cases, recovery mechanisms
- UX: Workflow clarity, error messaging, accessibility, feedback
- Code Quality: Testing coverage, documentation, technical debt
- Production Readiness: Deployment blockers, monitoring, rollback plans

Return VALID JSON (no markdown, no code blocks):
{
  "overallAssessment": {
    "productionReady": boolean,
    "overallScore": number (0-100),
    "confidenceLevel": "HIGH"|"MEDIUM"|"LOW",
    "executiveSummary": "2-3 sentence summary",
    "keyFindings": [string]
  },
  "criticalFindings": {
    "blockersCount": number,
    "mustFixBeforeLaunch": [{
      "title": string,
      "category": "SECURITY"|"RELIABILITY"|"DATA_INTEGRITY"|"WORKFLOW"|"PERFORMANCE",
      "severity": "CRITICAL"|"HIGH",
      "affectedFiles": [string],
      "description": string,
      "exploitScenario": string,
      "businessImpact": string,
      "remediation": string,
      "cweId": string
    }]
  },
  "dimensionScores": {
    "workflow": {"score": number, "rating": string, "issues": [string]},
    "security": {"score": number, "rating": string, "issues": [string]},
    "performance": {"score": number, "rating": string, "issues": [string]},
    "architecture": {"score": number, "rating": string, "issues": [string]},
    "reliability": {"score": number, "rating": string, "issues": [string]},
    "ux": {"score": number, "rating": string, "issues": [string]}
  },
  "fileAnalysis": [{
    "fileName": string,
    "overallScore": number,
    "strengths": [string],
    "criticalIssues": [{
      "title": string,
      "severity": "CRITICAL"|"HIGH",
      "description": string,
      "remediation": string
    }],
    "recommendations": [{
      "priority": "HIGH"|"MEDIUM"|"LOW",
      "title": string,
      "description": string
    }]
  }],
  "actionPlan": {
    "immediate": [{"action": string, "reason": string, "effort": string}],
    "shortTerm": [{"action": string, "reason": string, "effort": string}],
    "longTerm": [{"action": string, "reason": string, "effort": string}]
  }
}`;

    const userPrompt = `ZERO-FAIL Protocol Analysis - Documents Workflow

Focus: ${focusAreas.join(', ')}

FILES:
${filesContext}

Find ALL CRITICAL issues that would cause failures in production. Be specific, actionable, and reference CWE IDs where applicable.`;

    // Run verification with all models in parallel
    const verificationPromises = models.map(async (model): Promise<ModelResult> => {
      const modelStartTime = Date.now();
      console.log(`🚀 Starting verification with ${model}...`);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.error(`⏱️ ${model} timeout - exceeding 3 minutes`);
          controller.abort();
        }, 180000); // 3 minute timeout

        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_completion_tokens: 4000,
            response_format: { type: "json_object" }
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const duration = Date.now() - modelStartTime;

        console.log(`✅ ${model} responded with status: ${response.status} (${duration}ms)`);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`❌ ${model} error: ${response.status} - ${errorText.substring(0, 200)}`);
          
          return {
            model,
            success: false,
            error: `HTTP ${response.status}: ${errorText.substring(0, 100)}`,
            duration
          };
        }

        const aiResponse = await response.json();
        
        if (!aiResponse.choices?.[0]?.message?.content) {
          console.error(`❌ ${model} invalid response structure`);
          return {
            model,
            success: false,
            error: 'Invalid response structure - no content',
            duration
          };
        }

        const rawContent = aiResponse.choices[0].message.content;
        let verificationResult;

        try {
          verificationResult = JSON.parse(rawContent);
          console.log(`✅ ${model} JSON parsed successfully`);
        } catch (parseError) {
          console.error(`❌ ${model} JSON parse error:`, parseError);
          
          // Try to extract JSON from markdown
          const jsonMatch = rawContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
          if (jsonMatch) {
            try {
              verificationResult = JSON.parse(jsonMatch[1]);
              console.log(`✓ ${model} JSON extracted from markdown`);
            } catch {
              return {
                model,
                success: false,
                error: 'Failed to parse JSON from markdown',
                duration
              };
            }
          } else {
            return {
              model,
              success: false,
              error: `JSON parse failed: ${parseError instanceof Error ? parseError.message : 'Unknown'}`,
              duration
            };
          }
        }

        // Validate structure
        if (!verificationResult.fileAnalysis || !Array.isArray(verificationResult.fileAnalysis)) {
          return {
            model,
            success: false,
            error: 'Invalid verification structure - missing fileAnalysis',
            duration
          };
        }

        console.log(`✅ ${model} verification complete: Score ${verificationResult.overallAssessment?.overallScore || 0}/100`);

        return {
          model,
          success: true,
          verification: verificationResult,
          duration
        };

      } catch (error) {
        const duration = Date.now() - modelStartTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ ${model} verification failed:`, errorMessage);
        
        return {
          model,
          success: false,
          error: errorMessage,
          duration
        };
      }
    });

    const results = await Promise.all(verificationPromises);

    // Aggregate results
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`📊 Multi-model verification complete: ${successful.length} successful, ${failed.length} failed`);

    return new Response(
      JSON.stringify({
        success: successful.length > 0,
        results,
        summary: {
          totalModels: models.length,
          successfulModels: successful.length,
          failedModels: failed.length,
          averageScore: successful.length > 0 
            ? Math.round(successful.reduce((sum, r) => sum + (r.verification?.overallAssessment?.overallScore || 0), 0) / successful.length)
            : 0,
          consensus: successful.length >= 2 ? 'HIGH' : successful.length === 1 ? 'MEDIUM' : 'LOW',
          timestamp: new Date().toISOString()
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Multi-model verification error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    
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
