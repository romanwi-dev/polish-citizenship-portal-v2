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
    
    console.log(`🔍 Starting AI verification for ${files.length} files`);
    console.log(`📋 Focus areas: ${focusAreas.join(', ')}`);

    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Build comprehensive context for GPT-5
    const filesContext = files.map((f, idx) => 
      `\n${'='.repeat(80)}\nFILE ${idx + 1}: ${f.fileName} (${f.category})\n${'='.repeat(80)}\n${f.fileContent}\n`
    ).join('\n');

    const systemPrompt = `You are a senior engineer reviewing a Polish Citizenship portal's Documents Workflow.

Analyze for:
- Security: PII exposure, auth gaps, injection risks
- Reliability: Race conditions, error handling, data corruption
- Architecture: Design patterns, coupling, scalability
- Performance: Memory leaks, inefficient algorithms
- UX: Workflow clarity, error messaging, accessibility

Return VALID JSON:
{
  "overallAssessment": {
    "productionReady": boolean,
    "overallScore": number,
    "executiveSummary": "2-3 sentence summary"
  },
  "criticalFindings": {
    "blockersCount": number,
    "mustFixBeforeLaunch": [{
      "title": string,
      "category": "SECURITY"|"RELIABILITY"|"DATA_INTEGRITY",
      "severity": "CRITICAL",
      "affectedFiles": [string],
      "description": string,
      "remediation": string
    }]
  },
  "fileAnalysis": [{
    "fileName": string,
    "overallScore": number,
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
    "immediate": [{"action": string, "reason": string}],
    "shortTerm": [{"action": string, "reason": string}]
  }
}`;

    const userPrompt = `Analyze this Documents Workflow for production readiness.

Focus: ${focusAreas.slice(0, 3).join(', ')}

FILES:
${filesContext}

Find CRITICAL issues that block production. Be specific and actionable.`;

    console.log('📤 Sending request to Lovable AI (Gemini 2.5 Flash)...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.error('⏱️ Analysis timeout - exceeding 2.5 minutes');
      controller.abort();
    }, 150000); // 2.5 minute timeout (faster than OpenAI)

    try {
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${lovableApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          // Gemini 2.5 Flash doesn't support temperature or max_tokens parameters
          // It will use defaults which is sufficient for JSON responses
          response_format: { type: "json_object" }
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log(`✅ Lovable AI responded with status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Lovable AI error: ${response.status}`);
        console.error(`Error details: ${errorText.substring(0, 500)}`);
        
        if (response.status === 429) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Rate limit exceeded. Please wait a moment and try again.' 
            }),
            { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 402) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Payment required. Please add credits to your Lovable AI workspace.' 
            }),
            { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 401 || response.status === 403) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: 'Lovable AI authentication failed. Please contact support.' 
            }),
            { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        if (response.status === 400) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Lovable AI request error: ${errorText}` 
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        throw new Error(`Lovable AI error ${response.status}: ${errorText.substring(0, 200)}`);
      }

      const aiResponse = await response.json();
      console.log('📥 Received response from Lovable AI');
      console.log(`Response has ${aiResponse.choices?.length || 0} choices`);
      console.log(`Usage: ${JSON.stringify(aiResponse.usage || {})}`);
      
      if (!aiResponse.choices?.[0]?.message?.content) {
        console.error('❌ Invalid AI response structure:', JSON.stringify(aiResponse).substring(0, 500));
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid response from Lovable AI - no content returned. The model may have failed to generate a response.' 
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
                error: 'Lovable AI returned malformed JSON. Try again or reduce the number of files.',
                rawPreview: rawContent.substring(0, 200)
              }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        } else {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: `Failed to parse Lovable AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`,
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
            error: 'Lovable AI returned incomplete verification structure. The analysis may have been cut off.' 
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
            model: 'google/gemini-2.5-flash'
          }
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('⏱️ Analysis timeout - exceeded 2.5 minute limit');
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
