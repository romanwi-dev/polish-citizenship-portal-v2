import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BulkScanRequest {
  caseIds: string[];
  scanType: 'all' | 'unprocessed_only';
}

interface BulkScanResult {
  totalCases: number;
  totalDocuments: number;
  queuedForOCR: number;
  errors: Array<{ caseId: string; error: string }>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { caseIds, scanType }: BulkScanRequest = await req.json();

    if (!caseIds || !Array.isArray(caseIds) || caseIds.length === 0) {
      return new Response(
        JSON.stringify({ error: 'caseIds array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result: BulkScanResult = {
      totalCases: caseIds.length,
      totalDocuments: 0,
      queuedForOCR: 0,
      errors: []
    };

    // Process each case
    for (const caseId of caseIds) {
      try {
        // Build query based on scan type
        let query = supabase
          .from('documents')
          .select('id, ocr_status, dropbox_path')
          .eq('case_id', caseId);

        if (scanType === 'unprocessed_only') {
          query = query.in('ocr_status', ['pending', 'failed']);
        }

        const { data: documents, error: fetchError } = await query;

        if (fetchError) {
          result.errors.push({ caseId, error: fetchError.message });
          continue;
        }

        if (!documents || documents.length === 0) {
          continue;
        }

        result.totalDocuments += documents.length;

        // Queue documents for OCR processing
        // Update status to 'queued' so they can be picked up by OCR workers
        const { error: updateError } = await supabase
          .from('documents')
          .update({ ocr_status: 'queued' })
          .in('id', documents.map(d => d.id));

        if (updateError) {
          result.errors.push({ caseId, error: `Failed to queue documents: ${updateError.message}` });
          continue;
        }

        result.queuedForOCR += documents.length;

        console.log(`Queued ${documents.length} documents for case ${caseId}`);
      } catch (caseError) {
        const errorMsg = caseError instanceof Error ? caseError.message : 'Unknown error';
        result.errors.push({ caseId, error: errorMsg });
      }
    }

    console.log('Bulk scan completed:', result);

    return new Response(
      JSON.stringify({
        success: true,
        result,
        message: `Queued ${result.queuedForOCR} documents across ${result.totalCases} cases`
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Bulk scan error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
