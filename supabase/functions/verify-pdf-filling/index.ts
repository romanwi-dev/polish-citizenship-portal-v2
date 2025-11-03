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

    // First, check if case has ANY data
    const { data: caseData, error: caseError } = await supabase
      .from('master_table')
      .select('applicant_first_name, applicant_last_name, applicant_passport_number, poa_date_filed')
      .eq('case_id', caseId)
      .single();

    if (caseError || !caseData) {
      addResult('data_check', 'error', { error: 'No data found for this case' });
      return new Response(
        JSON.stringify({
          success: false,
          summary: {
            verdict: 'NO_DATA_TO_TEST',
            message: 'This case has no data in the database. Cannot verify PDF filling.',
            totalTests: 0,
            successCount: 0,
            errorCount: 1
          },
          results,
          recommendation: '❌ Choose a case with actual data to test PDF generation.'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const hasData = !!(caseData.applicant_first_name || caseData.applicant_last_name || 
                      caseData.applicant_passport_number || caseData.poa_date_filed);

    addResult('data_check', hasData ? 'success' : 'warning', {
      applicant_first_name: caseData.applicant_first_name || 'NULL',
      applicant_last_name: caseData.applicant_last_name || 'NULL',
      applicant_passport_number: caseData.applicant_passport_number || 'NULL',
      poa_date_filed: caseData.poa_date_filed || 'NULL',
      hasData
    });

    if (!hasData) {
      addResult('data_validation', 'error', { error: 'All fields are NULL - cannot verify filling' });
    }

    let aiVerificationsPassed = 0;
    let totalAiVerifications = 0;

    // ===== PROTOCOL RUN 1, 2, 3 =====
    for (let run = 1; run <= runCount; run++) {
      addResult(`run_${run}_start`, 'success', { run, templateType });

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
        addResult(`run_${run}_generate`, 'error', {
          status: generateResponse.status,
          error: errorText,
          duration: generateDuration
        });
        continue;
      }

      const generateData = await generateResponse.json();
      addResult(`run_${run}_generate`, 'success', {
        url: generateData.url?.substring(0, 100) + '...',
        duration: generateDuration,
        hasUrl: !!generateData.url
      });

      if (!generateData.url) {
        addResult(`run_${run}_no_url`, 'error', { data: generateData });
        continue;
      }

      // Step 2: Download the PDF
      const pdfResponse = await fetch(generateData.url);
      if (!pdfResponse.ok) {
        addResult(`run_${run}_download`, 'error', {
          status: pdfResponse.status,
          url: generateData.url.substring(0, 100)
        });
        continue;
      }

      const pdfBytes = await pdfResponse.arrayBuffer();
      const pdfSize = pdfBytes.byteLength;
      
      addResult(`run_${run}_download`, 'success', {
        size: pdfSize,
        sizeKB: Math.round(pdfSize / 1024)
      });

      // Step 3: AI Verification - Upload to Lovable AI and analyze
      totalAiVerifications++;
      
      try {
        // Convert PDF to base64 for AI analysis
        const base64Pdf = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
        
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${lovableApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: `Analyze this PDF form and answer:
1. Are form fields filled with actual data (names, dates, passport numbers)?
2. How many fields appear to be filled vs blank?
3. List specific data you can see (e.g., names, numbers)
4. Is this a filled form or blank template?

Respond in JSON:
{
  "fields_filled": true/false,
  "filled_count": number,
  "blank_count": number,
  "data_found": ["list", "of", "values"],
  "verdict": "FILLED" or "BLANK" or "PARTIALLY_FILLED"
}`
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:application/pdf;base64,${base64Pdf}`
                    }
                  }
                ]
              }
            ]
          })
        });

        if (!aiResponse.ok) {
          addResult(`run_${run}_ai_verify`, 'error', {
            status: aiResponse.status,
            error: await aiResponse.text()
          });
          continue;
        }

        const aiData = await aiResponse.json();
        const aiContent = aiData.choices?.[0]?.message?.content || '{}';
        const aiAnalysis = JSON.parse(aiContent);

        const passed = aiAnalysis.verdict === 'FILLED' && aiAnalysis.fields_filled;
        if (passed) aiVerificationsPassed++;

        addResult(`run_${run}_ai_verify`, passed ? 'success' : 'error', {
          verdict: aiAnalysis.verdict,
          fields_filled: aiAnalysis.fields_filled,
          filled_count: aiAnalysis.filled_count,
          data_found: aiAnalysis.data_found,
          analysis: aiContent
        });

      } catch (aiError: any) {
        addResult(`run_${run}_ai_verify`, 'error', {
          error: aiError.message,
          details: 'AI verification failed'
        });
      }

      addResult(`run_${run}_complete`, 'success', { run });
    }

    // ===== FINAL SUMMARY =====
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const warningCount = results.filter(r => r.status === 'warning').length;
    
    const finalVerdict = errorCount === 0 && aiVerificationsPassed === totalAiVerifications 
      ? 'ALL_TESTS_PASSED' 
      : 'TESTS_FAILED';

    const summary = {
      verdict: finalVerdict,
      totalRuns: runCount,
      totalTests: results.length,
      successCount,
      errorCount,
      warningCount,
      aiVerificationsPassed,
      totalAiVerifications,
      successRate: `${Math.round((successCount / results.length) * 100)}%`,
      message: errorCount === 0 && aiVerificationsPassed === totalAiVerifications
        ? '✅ All tests passed! PDFs are being filled correctly with actual data.'
        : `❌ ${errorCount} errors found. AI verified ${aiVerificationsPassed}/${totalAiVerifications} PDFs as filled.`,
      timestamp: new Date().toISOString()
    };

    return new Response(
      JSON.stringify({
        success: errorCount === 0 && aiVerificationsPassed === totalAiVerifications,
        summary,
        results,
        recommendation: errorCount === 0 && aiVerificationsPassed === totalAiVerifications
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
