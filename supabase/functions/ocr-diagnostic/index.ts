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

    console.log('🔍 OCR Diagnostic Tool - Starting analysis...');

    // Get terminal state documents
    const { data: terminalDocs, error: terminalError } = await supabase
      .from('documents')
      .select('id, case_id, name, dropbox_path, ocr_status, ocr_error_message, ocr_retry_count, created_at, updated_at')
      .in('ocr_status', ['missing_remote_file', 'pdf_corrupt', 'permanent_failure'])
      .order('updated_at', { ascending: false })
      .limit(100);

    if (terminalError) {
      throw terminalError;
    }

    // Get stuck pending documents (retry_at in the past but still pending)
    const { data: stuckPending, error: stuckError } = await supabase
      .from('documents')
      .select('id, case_id, name, dropbox_path, ocr_status, ocr_retry_count, ocr_next_retry_at')
      .eq('ocr_status', 'pending')
      .lt('ocr_next_retry_at', new Date().toISOString())
      .order('ocr_next_retry_at', { ascending: true })
      .limit(50);

    if (stuckError) {
      throw stuckError;
    }

    // Get recent HAC logs for OCR failures
    const { data: hacLogs, error: hacError } = await supabase
      .from('hac_logs')
      .select('*')
      .in('action_type', ['ocr_terminal_failure', 'dropbox_download_404'])
      .order('performed_at', { ascending: false })
      .limit(50);

    if (hacError) {
      throw hacError;
    }

    // Get retry statistics
    const { data: retryStats, error: retryError } = await supabase
      .from('documents')
      .select('ocr_status, ocr_retry_count')
      .in('ocr_status', ['pending', 'processing', 'missing_remote_file', 'pdf_corrupt', 'permanent_failure']);

    if (retryError) {
      throw retryError;
    }

    // Calculate statistics
    const stats = {
      terminal_states: {
        missing_remote_file: terminalDocs?.filter(d => d.ocr_status === 'missing_remote_file').length || 0,
        pdf_corrupt: terminalDocs?.filter(d => d.ocr_status === 'pdf_corrupt').length || 0,
        permanent_failure: terminalDocs?.filter(d => d.ocr_status === 'permanent_failure').length || 0,
      },
      stuck_pending: stuckPending?.length || 0,
      retry_distribution: retryStats?.reduce((acc: Record<number, number>, doc: any) => {
        const count = doc.ocr_retry_count || 0;
        acc[count] = (acc[count] || 0) + 1;
        return acc;
      }, {}) || {},
    };

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total_terminal_documents: terminalDocs?.length || 0,
        total_stuck_pending: stuckPending?.length || 0,
        total_hac_log_entries: hacLogs?.length || 0,
        statistics: stats,
      },
      terminal_documents: terminalDocs || [],
      stuck_pending_documents: stuckPending || [],
      recent_hac_logs: hacLogs || [],
    };

    console.log('✅ Diagnostic complete');
    console.log(`Terminal documents: ${report.summary.total_terminal_documents}`);
    console.log(`Stuck pending: ${report.summary.total_stuck_pending}`);

    return new Response(
      JSON.stringify(report, null, 2),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Diagnostic error:', error);
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
