import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_CONCURRENT_OCR = 5;
const MAX_RETRIES = 3;

/**
 * Classify errors as permanent (no retry) vs transient (retry with backoff)
 */
function classifyError(errorMessage: string): 'permanent' | 'transient' {
  const permanentPatterns = [
    /file not found/i,
    /invalid file format/i,
    /unsupported document type/i,
    /file path does not exist/i,
    /malformed_path/i,
    /path.*not found/i,
    /missing required fields/i,
  ];

  const transientPatterns = [
    /rate limit/i,
    /timeout/i,
    /network/i,
    /temporarily unavailable/i,
    /service unavailable/i,
    /internal server error/i,
    /502/,
    /503/,
    /504/,
  ];

  for (const pattern of permanentPatterns) {
    if (pattern.test(errorMessage)) return 'permanent';
  }

  for (const pattern of transientPatterns) {
    if (pattern.test(errorMessage)) return 'transient';
  }

  // Default to transient for unknown errors (safer to retry)
  return 'transient';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log("OCR Worker: Starting batch processing...");

    // Fetch queued documents (limit to MAX_CONCURRENT_OCR)
    const { data: queuedDocs, error: fetchError } = await supabase
      .from("documents")
      .select("id, case_id, dropbox_path, document_type, person_type, name, ocr_retry_count")
      .eq("ocr_status", "queued")
      .lt("ocr_retry_count", MAX_RETRIES)
      .order("created_at", { ascending: true })
      .limit(MAX_CONCURRENT_OCR);

    if (fetchError) {
      console.error("Failed to fetch queued documents:", fetchError);
      throw fetchError;
    }

    if (!queuedDocs || queuedDocs.length === 0) {
      console.log("No queued documents found");
      return new Response(
        JSON.stringify({ success: true, message: "No queued documents", processed: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Found ${queuedDocs.length} documents to process`);

    let successCount = 0;
    let failedCount = 0;
    const results: Array<{
      documentId?: string;
      name?: string;
      status: string;
      confidence?: number;
      error?: string;
      errorType?: string;
      retryCount?: number;
      willRetry?: boolean;
    }> = [];

    // Process documents in parallel (concurrency already limited by fetch query)
    const processPromises = queuedDocs.map(async (doc) => {
      const startTime = Date.now();
      let errorType: 'permanent' | 'transient' | null = null;
      
      try {
        console.log(`Processing document: ${doc.name} (${doc.id})`);

        // Update status to processing
        await supabase
          .from("documents")
          .update({ 
            ocr_status: "processing",
            updated_at: new Date().toISOString()
          })
          .eq("id", doc.id);

        // Download file from Dropbox using direct fetch with auth header
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        const downloadResponse = await fetch(
          `${supabaseUrl}/functions/v1/download-dropbox-file`,
          {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${serviceKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ dropboxPath: doc.dropbox_path }),
          }
        );

        if (!downloadResponse.ok) {
          const errorText = await downloadResponse.text();
          throw new Error(`Download failed: ${downloadResponse.status} ${downloadResponse.statusText} - ${errorText}`);
        }

        // Get file content as ArrayBuffer
        const arrayBuffer = await downloadResponse.arrayBuffer();
        
        // Convert to base64
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );

        // Call OCR function
        const { data: ocrResult, error: ocrError } = await supabase.functions.invoke(
          "ocr-universal",
          {
            body: {
              imageBase64: base64,
              documentId: doc.id,
              caseId: doc.case_id,
              documentType: doc.document_type,
              personType: doc.person_type,
            },
          }
        );

        if (ocrError) {
          throw new Error(`OCR failed: ${ocrError.message}`);
        }

        console.log(`✓ Successfully processed: ${doc.name}`);
        return {
          documentId: doc.id,
          name: doc.name,
          status: "success",
          confidence: ocrResult?.confidence,
        };

      } catch (error) {
        console.error(`✗ Failed to process ${doc.name}:`, error);

        // Classify error type
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        errorType = classifyError(errorMessage);

        // Increment retry count
        const newRetryCount = (doc.ocr_retry_count || 0) + 1;
        
        // Permanent errors skip retry - mark as failed immediately
        const newStatus = errorType === 'permanent' || newRetryCount >= MAX_RETRIES ? "failed" : "queued";

        await supabase
          .from("documents")
          .update({
            ocr_status: newStatus,
            ocr_retry_count: newRetryCount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", doc.id);

        // Log to ocr_processing_logs
        const processingTime = Date.now() - startTime;
        await supabase.from("ocr_processing_logs").insert({
          document_id: doc.id,
          case_id: doc.case_id,
          status: "failed",
          error_message: errorMessage,
          ocr_retry_count: newRetryCount,
          processing_duration_ms: processingTime,
          started_at: new Date(startTime).toISOString(),
          completed_at: new Date().toISOString(),
        });

        return {
          documentId: doc.id,
          name: doc.name,
          status: "failed",
          error: errorMessage,
          errorType,
          retryCount: newRetryCount,
          willRetry: newStatus === "queued",
        };
      }
    });

    // Wait for all documents to process in parallel
    const processResults = await Promise.allSettled(processPromises);
    
    // Count successes and failures
    processResults.forEach((result) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
        if (result.value.status === 'success') {
          successCount++;
        } else {
          failedCount++;
        }
      } else {
        failedCount++;
        results.push({
          status: 'failed',
          error: result.reason?.message || 'Unknown error'
        });
      }
    });

    console.log(`OCR Worker complete: ${successCount} successful, ${failedCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: queuedDocs.length,
        successful: successCount,
        failed: failedCount,
        results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("OCR Worker error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
