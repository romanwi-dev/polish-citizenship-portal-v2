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
  models?: string[]; // ['openai/gpt-5', 'google/gemini-2.5-pro', 'claude-sonnet-4-5']
  useAnthropic?: boolean; // Enable Claude via direct Anthropic API
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
    const { 
      files, 
      focusAreas, 
      models = ['openai/gpt-5', 'google/gemini-2.5-pro', 'claude-sonnet-4-5'],
      useAnthropic = true 
    } = await req.json() as VerificationRequest;
    
    console.log(`🔍 Starting ZERO-FAIL multi-model verification for ${files.length} files`);
    console.log(`📋 Focus areas: ${focusAreas.join(', ')}`);
    console.log(`🤖 Models: ${models.join(', ')}`);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const anthropicApiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (useAnthropic && !anthropicApiKey) {
      console.warn('⚠️ ANTHROPIC_API_KEY not configured - Claude models will be skipped');
    }

    // Validate that files have content
    for (const file of files) {
      if (!file.fileContent || file.fileContent.trim() === '') {
        console.error(`❌ File ${file.fileName} has no content!`);
        throw new Error(`File ${file.fileName} must have content for verification`);
      }
      console.log(`✅ File ${file.fileName}: ${file.fileContent.length} characters`);
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

CRITICAL: Your response must be ONLY valid JSON. Do not wrap in markdown code blocks. Do not include any text before or after the JSON. Start with { and end with }.
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

    // Helper function to call Claude via Anthropic API with retry logic
    const callClaudeAPI = async (model: string, systemPrompt: string, userPrompt: string): Promise<any> => {
      const maxRetries = 3; // FIXED: Increased retries
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          if (attempt > 0) {
            const backoffMs = 2000 * Math.pow(2, attempt - 1); // FIXED: Longer backoff
            console.log(`⏱️ ${model} retry attempt ${attempt}/${maxRetries} after ${backoffMs}ms backoff`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
          }

          console.log(`📤 Calling Anthropic API for ${model} (attempt ${attempt + 1}/${maxRetries + 1})...`);

          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': anthropicApiKey!,
              'anthropic-version': '2023-06-01',
              'content-type': 'application/json',
            },
            body: JSON.stringify({
              model,
              max_tokens: 16000, // FIXED: Increased token limit to prevent truncation
              temperature: 0.2,
              system: systemPrompt,
              messages: [
                { role: 'user', content: userPrompt }
              ]
            })
          });

          // Retry on 502 errors (infrastructure issues) and 529 errors (overloaded)
          if ((response.status === 502 || response.status === 529) && attempt < maxRetries) {
            console.warn(`⚠️ ${model} returned ${response.status} - will retry`);
            lastError = new Error(`${response.status} error (attempt ${attempt + 1}/${maxRetries + 1})`);
            continue;
          }

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ ${model} API error ${response.status}:`, errorText.substring(0, 200));
            throw new Error(`Anthropic API error ${response.status}: ${errorText.substring(0, 200)}`);
          }

          const data = await response.json();
          console.log(`✅ ${model} API response received - ${data.usage?.input_tokens || 0} input tokens`);
          
          // Convert Anthropic response to OpenAI-like format for consistency
          return {
            choices: [{
              message: {
                content: data.content[0].text
              }
            }],
            usage: {
              prompt_tokens: data.usage.input_tokens,
              completion_tokens: data.usage.output_tokens,
              total_tokens: data.usage.input_tokens + data.usage.output_tokens
            }
          };
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error');
          console.error(`❌ ${model} attempt ${attempt + 1} failed:`, lastError.message);
          if (attempt === maxRetries) {
            throw lastError;
          }
        }
      }

      throw lastError || new Error('Claude API call failed after retries');
    };

    // Run verification with all models in parallel
    const verificationPromises = models.map(async (model): Promise<ModelResult> => {
      const modelStartTime = Date.now();
      console.log(`🚀 Starting verification with ${model}...`);

      // Skip Claude models if Anthropic API key not configured
      if (model.startsWith('claude-') && !anthropicApiKey) {
        console.warn(`⚠️ Skipping ${model} - ANTHROPIC_API_KEY not configured`);
        return {
          model,
          success: false,
          error: 'Anthropic API key not configured',
          duration: Date.now() - modelStartTime
        };
      }

      try {
        const controller = new AbortController();
        // FIXED: Extended timeouts for complex analysis - 10 min for GPT-5, 8 min for others
        const timeoutMs = model.startsWith('openai/gpt-5') ? 600000 : 480000;
        const timeoutId = setTimeout(() => {
          console.error(`⏱️ ${model} timeout - exceeding ${timeoutMs / 60000} minutes`);
          controller.abort();
        }, timeoutMs);

        let aiResponse;

        // Route to appropriate API based on model
        if (model.startsWith('claude-')) {
          // Use Anthropic API for Claude models
          console.log(`📤 Calling Anthropic API for ${model}...`);
          aiResponse = await callClaudeAPI(model, systemPrompt, userPrompt);
          clearTimeout(timeoutId);
        } else {
          // Use Lovable AI Gateway for OpenAI and Google models
          console.log(`📤 Calling Lovable AI Gateway for ${model}...`);
          // Build request body - GPT-5 doesn't support temperature parameter
          const requestBody: any = {
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            max_completion_tokens: 16000,
          };
          
          // Only add temperature for non-GPT-5 models
          if (!model.startsWith('openai/gpt-5')) {
            requestBody.temperature = 0.2;
          }

          const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${lovableApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          console.log(`✅ ${model} responded with status: ${response.status}`);

          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ ${model} error: ${response.status} - ${errorText.substring(0, 200)}`);
            
            return {
              model,
              success: false,
              error: `HTTP ${response.status}: ${errorText.substring(0, 100)}`,
              duration: Date.now() - modelStartTime
            };
          }

          aiResponse = await response.json();
        }

        const duration = Date.now() - modelStartTime;
        console.log(`✅ ${model} completed in ${duration}ms`);
        
        // Log full response for debugging
        console.log(`📋 ${model} full response:`, JSON.stringify(aiResponse).substring(0, 500));
        
        if (!aiResponse.choices?.[0]?.message?.content) {
          console.error(`❌ ${model} invalid response structure - full response:`, JSON.stringify(aiResponse));
          return {
            model,
            success: false,
            error: `Invalid response structure - no content. Response: ${JSON.stringify(aiResponse).substring(0, 200)}`,
            duration
          };
        }

        const rawContent = aiResponse.choices[0].message.content;
        console.log(`📄 ${model} raw content preview:`, rawContent.substring(0, 300));
        let verificationResult;

        // STRATEGY: Try markdown extraction FIRST (Gemini wraps in markdown), then direct parse
        
        // 1. Try extracting from markdown code blocks FIRST (```json or ```)
        const jsonMatch = rawContent.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
        if (jsonMatch) {
          try {
            verificationResult = JSON.parse(jsonMatch[1]);
            console.log(`✅ ${model} JSON extracted from markdown code block - score: ${verificationResult.overallAssessment?.overallScore || 'N/A'}`);
          } catch (markdownError) {
            console.error(`❌ ${model} failed to parse JSON from markdown:`, markdownError);
            console.error(`📄 ${model} markdown content:`, jsonMatch[1].substring(0, 500));
            return {
              model,
              success: false,
              error: `Failed to parse JSON from markdown: ${markdownError instanceof Error ? markdownError.message : 'Unknown'}`,
              duration
            };
          }
        } else {
          // 2. Try direct JSON parse (if no markdown detected)
          try {
            verificationResult = JSON.parse(rawContent);
            console.log(`✅ ${model} JSON parsed directly - score: ${verificationResult.overallAssessment?.overallScore || 'N/A'}`);
          } catch (parseError) {
            console.error(`❌ ${model} direct JSON parse failed:`, parseError);
            console.error(`📄 ${model} raw content that failed:`, rawContent.substring(0, 500));
            
            // 3. Fallback: Try to find any JSON object in the response
            const jsonObjectMatch = rawContent.match(/\{[\s\S]*\}/);
            if (jsonObjectMatch) {
              try {
                verificationResult = JSON.parse(jsonObjectMatch[0]);
                console.log(`✓ ${model} JSON extracted from raw text fallback`);
              } catch {
                return {
                  model,
                  success: false,
                  error: `All JSON parsing attempts failed - content preview: ${rawContent.substring(0, 200)}`,
                  duration
                };
              }
            } else {
              return {
                model,
                success: false,
                error: `No JSON found in response - content preview: ${rawContent.substring(0, 200)}`,
                duration
              };
            }
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

    // CRITICAL: Verify ALL 3 models completed
    if (results.length !== 3) {
      throw new Error(`CRITICAL: Expected 3 model results, got ${results.length}`);
    }

    // Aggregate results
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`📊 Multi-model verification complete: ${successful.length}/3 successful, ${failed.length}/3 failed`);
    console.log(`🎯 Model scores:`, results.map(r => 
      `${r.model}: ${r.success ? (r.verification?.overallAssessment?.overallScore || 0) + '/100' : 'FAILED'}`
    ).join(', '));

    // A→B→EX Protocol enforcement: ALL 3 models must succeed with 100/100
    const allScoresAt100 = successful.length === 3 && successful.every(r => 
      r.verification?.overallAssessment?.overallScore === 100
    );

    if (!allScoresAt100) {
      console.log(`❌ A→B→EX VERIFICATION FAILED - Requirement: ALL 3 models at 100/100`);
      console.log(`   Results: ${results.map(r => 
        `${r.model}: ${r.success ? r.verification?.overallAssessment?.overallScore : 'ERROR'}`
      ).join(', ')}`);
    } else {
      console.log(`✅ A→B→EX VERIFICATION PASSED - All 3 models scored 100/100`);
    }

    return new Response(
      JSON.stringify({
        success: allScoresAt100,  // STRICT: Only true if ALL 3 scored 100/100
        allModelsCompleted: results.length === 3,
        passedABEXProtocol: allScoresAt100,
        results,
        summary: {
          totalModels: models.length,
          successfulModels: successful.length,
          failedModels: failed.length,
          averageScore: successful.length > 0 
            ? Math.round(successful.reduce((sum, r) => sum + (r.verification?.overallAssessment?.overallScore || 0), 0) / successful.length)
            : 0,
          minimumScore: successful.length > 0
            ? Math.min(...successful.map(r => r.verification?.overallAssessment?.overallScore || 0))
            : 0,
          maximumScore: successful.length > 0
            ? Math.max(...successful.map(r => r.verification?.overallAssessment?.overallScore || 0))
            : 0,
          consensus: successful.length === 3 ? 'ALL_AGREE' : successful.length >= 2 ? 'MAJORITY' : successful.length === 1 ? 'LOW' : 'NONE',
          protocolStatus: allScoresAt100 ? 'PASS - Ready for Phase EX' : 'FAIL - Return to Phase A',
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
