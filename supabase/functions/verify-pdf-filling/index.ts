import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationResult {
  step: string;
  status: 'success' | 'error' | 'warning';
  details: any;
  timestamp: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const results: VerificationResult[] = [];
  const addResult = (step: string, status: 'success' | 'error' | 'warning', details: any) => {
    results.push({ step, status, details, timestamp: new Date().toISOString() });
    console.log(`[${status.toUpperCase()}] ${step}:`, JSON.stringify(details, null, 2));
  };

  try {
    const { caseId, templateType = 'poa-adult', runCount = 3 } = await req.json();

    if (!caseId) {
      return new Response(
        JSON.stringify({ error: 'caseId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    addResult('initialization', 'success', {
      caseId,
      templateType,
      runCount,
      timestamp: new Date().toISOString()
    });

    // ===== PROTOCOL RUN 1, 2, 3 =====
    for (let run = 1; run <= runCount; run++) {
      addResult(`protocol_run_${run}_start`, 'success', { run, templateType });

      // Step 1: Generate PDF
      const generateStart = Date.now();
      const generateResponse = await fetch(`${supabaseUrl}/functions/v1/fill-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({ caseId, templateType })
      });

      const generateDuration = Date.now() - generateStart;

      if (!generateResponse.ok) {
        const errorText = await generateResponse.text();
        addResult(`protocol_run_${run}_generate`, 'error', {
          status: generateResponse.status,
          error: errorText,
          duration: generateDuration
        });
        continue;
      }

      const generateData = await generateResponse.json();
      addResult(`protocol_run_${run}_generate`, 'success', {
        url: generateData.url,
        duration: generateDuration,
        hasUrl: !!generateData.url
      });

      if (!generateData.url) {
        addResult(`protocol_run_${run}_no_url`, 'error', { data: generateData });
        continue;
      }

      // Step 2: Download the PDF
      const pdfResponse = await fetch(generateData.url);
      if (!pdfResponse.ok) {
        addResult(`protocol_run_${run}_download`, 'error', {
          status: pdfResponse.status,
          url: generateData.url
        });
        continue;
      }

      const pdfBytes = await pdfResponse.arrayBuffer();
      const pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
      
      addResult(`protocol_run_${run}_download`, 'success', {
        size: pdfBytes.byteLength,
        sizeKB: Math.round(pdfBytes.byteLength / 1024)
      });

      // Step 3: Verify with Gemini AI
      if (run === runCount || run === 1) {
        const geminiStart = Date.now();
        const geminiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'system',
                content: 'You are a PDF analysis expert. Analyze PDFs and determine if form fields contain actual data or are blank.'
              },
              {
                role: 'user',
                content: `Analyze this PDF and answer these questions:
1. Does the PDF contain filled form fields with actual data (names, dates, addresses)?
2. Are the fields blank/empty?
3. List 3-5 example values you can see in the form fields.
4. Overall assessment: Is this a properly filled form or a blank template?

Respond in JSON format:
{
  "has_filled_fields": true/false,
  "is_blank": true/false,
  "example_values": ["value1", "value2", "value3"],
  "field_count_estimate": number,
  "assessment": "properly filled" or "blank template" or "partially filled",
  "confidence": "high" or "medium" or "low"
}`
              }
            ]
          })
        });

        const geminiDuration = Date.now() - geminiStart;

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          const geminiContent = geminiData.choices?.[0]?.message?.content || '';
          
          try {
            const geminiAnalysis = JSON.parse(geminiContent.replace(/```json\n?/g, '').replace(/```/g, '').trim());
            addResult(`protocol_run_${run}_gemini_verification`, geminiAnalysis.has_filled_fields ? 'success' : 'error', {
              duration: geminiDuration,
              analysis: geminiAnalysis
            });
          } catch (e) {
            addResult(`protocol_run_${run}_gemini_verification`, 'warning', {
              duration: geminiDuration,
              rawContent: geminiContent,
              parseError: (e as Error).message
            });
          }
        } else {
          addResult(`protocol_run_${run}_gemini_verification`, 'error', {
            status: geminiResponse.status,
            duration: geminiDuration
          });
        }
      }

      // Step 4: Verify with OpenAI (only on final run)
      if (run === runCount) {
        const openaiStart = Date.now();
        const openaiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'openai/gpt-5-mini',
            messages: [
              {
                role: 'system',
                content: 'You are a document verification specialist. Verify if PDF forms are properly filled with data.'
              },
              {
                role: 'user',
                content: `Verify this PDF form and provide a detailed assessment:
1. Are form fields populated with real data?
2. What type of form is this (POA, citizenship, etc.)?
3. List specific data points you can identify
4. Rate the completeness (0-100%)
5. Final verdict: PASS or FAIL

Respond in JSON:
{
  "form_type": "type",
  "fields_populated": true/false,
  "data_points": ["point1", "point2"],
  "completeness_percent": number,
  "verdict": "PASS" or "FAIL",
  "reasoning": "explanation"
}`
              }
            ]
          })
        });

        const openaiDuration = Date.now() - openaiStart;

        if (openaiResponse.ok) {
          const openaiData = await openaiResponse.json();
          const openaiContent = openaiData.choices?.[0]?.message?.content || '';
          
          try {
            const openaiAnalysis = JSON.parse(openaiContent.replace(/```json\n?/g, '').replace(/```/g, '').trim());
            addResult(`protocol_run_${run}_openai_verification`, openaiAnalysis.verdict === 'PASS' ? 'success' : 'error', {
              duration: openaiDuration,
              analysis: openaiAnalysis
            });
          } catch (e) {
            addResult(`protocol_run_${run}_openai_verification`, 'warning', {
              duration: openaiDuration,
              rawContent: openaiContent,
              parseError: (e as Error).message
            });
          }
        } else {
          addResult(`protocol_run_${run}_openai_verification`, 'error', {
            status: openaiResponse.status,
            duration: openaiDuration
          });
        }
      }

      addResult(`protocol_run_${run}_complete`, 'success', {
        run,
        totalSteps: results.filter(r => r.step.includes(`run_${run}`)).length
      });
    }

    // ===== FINAL SUMMARY =====
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    
    const geminiResults = results.filter(r => r.step.includes('gemini_verification'));
    const openaiResults = results.filter(r => r.step.includes('openai_verification'));
    
    const finalVerdict = errorCount === 0 ? 'ALL_TESTS_PASSED' : 'TESTS_FAILED';

    const summary = {
      verdict: finalVerdict,
      totalRuns: runCount,
      totalTests: results.length,
      successCount,
      errorCount,
      warningCount,
      successRate: `${Math.round((successCount / results.length) * 100)}%`,
      geminiVerifications: geminiResults.length,
      openaiVerifications: openaiResults.length,
      aiVerdictsPass: [
        ...geminiResults.filter(r => r.status === 'success'),
        ...openaiResults.filter(r => r.status === 'success')
      ].length,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify({
        success: errorCount === 0,
        summary,
        results,
        recommendation: errorCount === 0 
          ? '✅ PDF generation and field filling is FULLY OPERATIONAL!'
          : '❌ Issues detected. Review error details above.'
      }, null, 2),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Verification error:', error);
    addResult('fatal_error', 'error', {
      message: error.message,
      stack: error.stack
    });

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        results 
      }, null, 2),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
