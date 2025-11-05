import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { getSecurityHeaders } from "../_shared/security-headers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_CONCURRENT_OCR = 5;
const MAX_RETRIES = 3;

/**
 * Classify errors as permanent (no retry) vs transient (retry with backoff)
 * PHASE 1 FIX: Enhanced classification for Dropbox path errors
 */
function classifyError(errorMessage: string): 'permanent' | 'transient' {
  const permanentPatterns = [
    /file not found/i,
    /invalid file format/i,
    /unsupported document type/i,
    /file path does not exist/i,
    /malformed_path/i,
    /path.*not found/i,
    /path.*not_found/i, // Dropbox error format
    /missing required fields/i,
    /409/, // Dropbox conflict (usually path issues)
    /all.*path variations failed/i, // Our new comprehensive path check
    /dropbox download failed.*409/i,
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
    if (pattern.test(errorMessage)) {
      console.log(`  🚫 Classified as PERMANENT error (pattern: ${pattern})`);
      return 'permanent';
    }
  }

  for (const pattern of transientPatterns) {
    if (pattern.test(errorMessage)) {
      console.log(`  ⏳ Classified as TRANSIENT error (pattern: ${pattern})`);
      return 'transient';
    }
  }

  // Default to transient for unknown errors (safer to retry)
  console.log(`  ⚠️ Unknown error type - defaulting to TRANSIENT`);
  return 'transient';
}

serve(async (req) => {
  const origin = req.headers.get('Origin');
  const secureHeaders = getSecurityHeaders(origin);
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: secureHeaders });
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
        { headers: { ...secureHeaders, "Content-Type": "application/json" } }
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
      let resolvedPath: string | null = null;
      
      try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`📄 Processing: ${doc.name}`);
        console.log(`   Document ID: ${doc.id}`);
        console.log(`   Original Path: ${doc.dropbox_path}`);
        console.log(`   Retry Count: ${doc.ocr_retry_count || 0}/${MAX_RETRIES}`);
        console.log(`${'='.repeat(60)}`);

        // Update status to processing
        await supabase
          .from("documents")
          .update({ 
            ocr_status: "processing",
            updated_at: new Date().toISOString()
          })
          .eq("id", doc.id);

        // Download file from Dropbox using enhanced path resolution
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        console.log('📥 Calling download-dropbox-file with path validation...');
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
          console.error(`❌ Download failed: ${downloadResponse.status} ${downloadResponse.statusText}`);
          console.error(`   Error details: ${errorText}`);
          throw new Error(`Download failed: ${downloadResponse.status} ${downloadResponse.statusText} - ${errorText}`);
        }

        // Extract resolved path from response header (if available)
        resolvedPath = downloadResponse.headers.get('X-Dropbox-Path-Resolved');
        if (resolvedPath) {
          console.log(`✓ Download successful!`);
          console.log(`  Resolved Path: ${resolvedPath}`);
          
          // Update document with corrected path if different
          if (resolvedPath !== doc.dropbox_path) {
            console.log(`  → Updating database with corrected path`);
            await supabase
              .from("documents")
              .update({ dropbox_path: resolvedPath })
              .eq("id", doc.id);
          }
        } else {
          console.log(`✓ Download successful (no path resolution needed)`);
        }

        // Get file content as ArrayBuffer
        const arrayBuffer = await downloadResponse.arrayBuffer();
        console.log(`  File size: ${(arrayBuffer.byteLength / 1024).toFixed(1)} KB`);
        
        // Convert to base64
        console.log('🔄 Converting to base64...');
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ""
          )
        );

        // Call OCR function
        console.log('🤖 Calling OCR universal...');
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
          console.error(`❌ OCR failed: ${ocrError.message}`);
          throw new Error(`OCR failed: ${ocrError.message}`);
        }

        const processingTime = Date.now() - startTime;
        console.log(`✅ Successfully processed in ${(processingTime / 1000).toFixed(1)}s`);
        console.log(`   Confidence: ${ocrResult?.confidence || 'N/A'}`);
        console.log(`${'='.repeat(60)}\n`);
        
        return {
          documentId: doc.id,
          name: doc.name,
          status: "success",
          confidence: ocrResult?.confidence,
          resolvedPath,
        };

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        const processingTime = Date.now() - startTime;
        
        console.error(`\n${'='.repeat(60)}`);
        console.error(`❌ PROCESSING FAILED: ${doc.name}`);
        console.error(`   Error: ${errorMessage}`);
        console.error(`   Processing time: ${(processingTime / 1000).toFixed(1)}s`);
        
        // Classify error type
        errorType = classifyError(errorMessage);
        console.error(`   Error type: ${errorType.toUpperCase()}`);

        // Increment retry count
        const newRetryCount = (doc.ocr_retry_count || 0) + 1;
        
        // Permanent errors skip retry - mark as failed immediately
        const newStatus = errorType === 'permanent' || newRetryCount >= MAX_RETRIES ? "failed" : "queued";
        
        if (errorType === 'permanent') {
          console.error(`   → Marking as FAILED (permanent error - no retry)`);
        } else if (newRetryCount >= MAX_RETRIES) {
          console.error(`   → Marking as FAILED (max retries reached: ${MAX_RETRIES})`);
        } else {
          console.error(`   → Re-queuing for retry (attempt ${newRetryCount}/${MAX_RETRIES})`);
        }
        console.error(`${'='.repeat(60)}\n`);

        await supabase
          .from("documents")
          .update({
            ocr_status: newStatus,
            ocr_retry_count: newRetryCount,
            updated_at: new Date().toISOString(),
          })
          .eq("id", doc.id);

        // Log to ocr_processing_logs
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
      { headers: { ...secureHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("OCR Worker error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...secureHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
