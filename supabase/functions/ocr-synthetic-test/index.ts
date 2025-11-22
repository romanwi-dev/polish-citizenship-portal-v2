import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🧪 V9 SYNTHETIC OCR TEST SUITE - Starting...');

    const testResults = {
      timestamp: new Date().toISOString(),
      tests: [] as any[],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
      },
    };

    // Get a real case_id for testing
    const { data: cases } = await supabase
      .from('cases')
      .select('id')
      .limit(1);

    if (!cases || cases.length === 0) {
      throw new Error('No cases found in database for testing');
    }

    const testCaseId = cases[0].id;

    // TEST 1: Create document and verify initial state
    console.log('\n📝 TEST 1: Document creation and initial state');
    const test1Start = Date.now();
    
    const { data: doc1, error: doc1Error } = await supabase
      .from('documents')
      .insert({
        case_id: testCaseId,
        name: '[SYNTHETIC-TEST] Missing file test.pdf',
        dropbox_path: '/NONEXISTENT/PATH/test.pdf',
        ocr_status: 'pending',
        file_extension: 'pdf',
      })
      .select()
      .single();

    const test1Result = {
      name: 'Document Creation',
      passed: !doc1Error && doc1 !== null,
      duration_ms: Date.now() - test1Start,
      details: doc1Error ? `Error: ${doc1Error.message}` : `Created doc ${doc1.id}`,
    };
    testResults.tests.push(test1Result);
    testResults.summary.total++;
    if (test1Result.passed) testResults.summary.passed++;
    else testResults.summary.failed++;

    if (!doc1) {
      throw new Error('Failed to create test document');
    }

    // Wait a moment for trigger to fire
    await new Promise(resolve => setTimeout(resolve, 500));

    // TEST 2: Verify ocr_status_history trigger
    console.log('\n📊 TEST 2: OCR Status History trigger (V9.2)');
    const test2Start = Date.now();

    const { data: historyRecords, error: historyError } = await supabase
      .from('ocr_status_history')
      .select('*')
      .eq('document_id', doc1.id);

    const test2Result = {
      name: 'OCR Status History Trigger',
      passed: !historyError && historyRecords && historyRecords.length > 0,
      duration_ms: Date.now() - test2Start,
      details: historyError 
        ? `Error: ${historyError.message}` 
        : `Found ${historyRecords?.length || 0} history records`,
    };
    testResults.tests.push(test2Result);
    testResults.summary.total++;
    if (test2Result.passed) testResults.summary.passed++;
    else testResults.summary.failed++;

    // TEST 3: Trigger OCR worker
    console.log('\n⚙️ TEST 3: Trigger OCR processing');
    const test3Start = Date.now();

    const { data: workerResult, error: workerError } = await supabase.functions.invoke('ocr-worker', {
      body: { batchSize: 5 },
    });

    const test3Result = {
      name: 'OCR Worker Invocation',
      passed: !workerError,
      duration_ms: Date.now() - test3Start,
      details: workerError 
        ? `Error: ${workerError.message}` 
        : `Batch result: ${JSON.stringify(workerResult)}`,
    };
    testResults.tests.push(test3Result);
    testResults.summary.total++;
    if (test3Result.passed) testResults.summary.passed++;
    else testResults.summary.failed++;

    // Wait for OCR processing
    await new Promise(resolve => setTimeout(resolve, 3000));

    // TEST 4: Verify terminal state handling (V9.3)
    console.log('\n🔴 TEST 4: Terminal state handling (missing_remote_file)');
    const test4Start = Date.now();

    const { data: updatedDoc, error: updateError } = await supabase
      .from('documents')
      .select('ocr_status, ocr_error_message, ocr_retry_count')
      .eq('id', doc1.id)
      .single();

    const test4Result = {
      name: 'Terminal State Detection',
      passed: !updateError && updatedDoc?.ocr_status === 'missing_remote_file',
      duration_ms: Date.now() - test4Start,
      details: updateError 
        ? `Error: ${updateError.message}` 
        : `Status: ${updatedDoc?.ocr_status}, Retries: ${updatedDoc?.ocr_retry_count}`,
    };
    testResults.tests.push(test4Result);
    testResults.summary.total++;
    if (test4Result.passed) testResults.summary.passed++;
    else testResults.summary.failed++;

    // TEST 5: Verify HAC logs (V9.2)
    console.log('\n📋 TEST 5: HAC logging for terminal states');
    const test5Start = Date.now();

    const { data: hacLogs, error: hacError } = await supabase
      .from('hac_logs')
      .select('*')
      .eq('case_id', testCaseId)
      .in('action_type', ['ocr_terminal_failure', 'dropbox_download_404'])
      .order('performed_at', { ascending: false })
      .limit(10);

    const test5Result = {
      name: 'HAC Logging',
      passed: !hacError && hacLogs && hacLogs.length > 0,
      duration_ms: Date.now() - test5Start,
      details: hacError 
        ? `Error: ${hacError.message}` 
        : `Found ${hacLogs?.length || 0} HAC log entries`,
    };
    testResults.tests.push(test5Result);
    testResults.summary.total++;
    if (test5Result.passed) testResults.summary.passed++;
    else testResults.summary.failed++;

    // TEST 6: Verify audit trail completeness
    console.log('\n🔍 TEST 6: Audit trail completeness');
    const test6Start = Date.now();

    const { data: fullHistory, error: fullHistoryError } = await supabase
      .from('ocr_status_history')
      .select('*')
      .eq('document_id', doc1.id)
      .order('changed_at', { ascending: true });

    const test6Result = {
      name: 'Audit Trail Completeness',
      passed: !fullHistoryError && fullHistory && fullHistory.length >= 2,
      duration_ms: Date.now() - test6Start,
      details: fullHistoryError 
        ? `Error: ${fullHistoryError.message}` 
        : `Status transitions: ${fullHistory?.map(h => h.to_status).join(' → ')}`,
    };
    testResults.tests.push(test6Result);
    testResults.summary.total++;
    if (test6Result.passed) testResults.summary.passed++;
    else testResults.summary.failed++;

    // TEST 7: Create stuck pending document
    console.log('\n⏱️ TEST 7: Stuck pending document detection');
    const test7Start = Date.now();

    const { data: doc2, error: doc2Error } = await supabase
      .from('documents')
      .insert({
        case_id: testCaseId,
        name: '[SYNTHETIC-TEST] Stuck pending test.jpg',
        dropbox_path: '/CASES/TEST/stuck.jpg',
        ocr_status: 'pending',
        ocr_next_retry_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        ocr_retry_count: 1,
        file_extension: 'jpg',
      })
      .select()
      .single();

    await new Promise(resolve => setTimeout(resolve, 500));

    // Trigger worker to detect stuck document
    await supabase.functions.invoke('ocr-worker', { body: { batchSize: 5 } });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const { data: stuckHacLogs, error: stuckHacError } = await supabase
      .from('hac_logs')
      .select('*')
      .eq('case_id', testCaseId)
      .eq('action_type', 'ocr_stuck_pending')
      .order('performed_at', { ascending: false })
      .limit(1);

    const test7Result = {
      name: 'Stuck Pending Detection',
      passed: !doc2Error && !stuckHacError && stuckHacLogs && stuckHacLogs.length > 0,
      duration_ms: Date.now() - test7Start,
      details: stuckHacLogs && stuckHacLogs.length > 0
        ? `HAC log: ${stuckHacLogs[0].action_details}`
        : 'No stuck pending HAC log found',
    };
    testResults.tests.push(test7Result);
    testResults.summary.total++;
    if (test7Result.passed) testResults.summary.passed++;
    else testResults.summary.failed++;

    // TEST 8: Verify diagnostic tool
    console.log('\n🔧 TEST 8: OCR diagnostic tool');
    const test8Start = Date.now();

    const { data: diagResult, error: diagError } = await supabase.functions.invoke('ocr-diagnostic');

    const test8Result = {
      name: 'OCR Diagnostic Tool',
      passed: !diagError && diagResult,
      duration_ms: Date.now() - test8Start,
      details: diagError 
        ? `Error: ${diagError.message}` 
        : `Terminal docs: ${diagResult?.summary?.total_terminal_documents || 0}`,
    };
    testResults.tests.push(test8Result);
    testResults.summary.total++;
    if (test8Result.passed) testResults.summary.passed++;
    else testResults.summary.failed++;

    // Cleanup test documents
    console.log('\n🧹 Cleaning up test documents...');
    await supabase
      .from('documents')
      .delete()
      .in('id', [doc1.id, doc2?.id].filter(Boolean));

    // Generate summary
    const successRate = ((testResults.summary.passed / testResults.summary.total) * 100).toFixed(1);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 V9 SYNTHETIC TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`✅ Passed: ${testResults.summary.passed}/${testResults.summary.total}`);
    console.log(`❌ Failed: ${testResults.summary.failed}/${testResults.summary.total}`);
    console.log(`📈 Success Rate: ${successRate}%`);
    console.log('='.repeat(60));

    testResults.tests.forEach((test, idx) => {
      const icon = test.passed ? '✅' : '❌';
      console.log(`${icon} ${idx + 1}. ${test.name} (${test.duration_ms}ms)`);
      console.log(`   ${test.details}`);
    });

    return new Response(
      JSON.stringify({
        ...testResults,
        success_rate: successRate,
        verdict: testResults.summary.failed === 0 ? 'PASSED' : 'FAILED',
      }, null, 2),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Synthetic test error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
