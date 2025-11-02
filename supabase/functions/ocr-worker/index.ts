import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MAX_CONCURRENT_OCR = 5;
const MAX_RETRIES = 3;

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
    const results = [];

    // Process documents sequentially to avoid rate limits
    for (const doc of queuedDocs) {
      try {
        console.log(`Processing document: ${doc.name} (${doc.id})`);

        // Update status to processing
        await supabase
          .from("documents")
          .update({ ocr_status: "processing" })
          .eq("id", doc.id);

        // Download file from Dropbox
        const { data: fileData, error: downloadError } = await supabase.functions.invoke(
          "dropbox-download",
          {
            body: { file_path: doc.dropbox_path },
          }
        );

        if (downloadError) {
          throw new Error(`Download failed: ${downloadError.message}`);
        }

        // Convert to base64
        const arrayBuffer = await fileData.arrayBuffer();
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

        console.log(`Successfully processed: ${doc.name}`);
        successCount++;
        results.push({
          documentId: doc.id,
          name: doc.name,
          status: "success",
          confidence: ocrResult?.confidence,
        });

      } catch (error) {
        console.error(`Failed to process ${doc.name}:`, error);
        failedCount++;

        // Increment retry count
        const newRetryCount = (doc.ocr_retry_count || 0) + 1;
        const newStatus = newRetryCount >= MAX_RETRIES ? "failed" : "queued";

        await supabase
          .from("documents")
          .update({
            ocr_status: newStatus,
            ocr_retry_count: newRetryCount,
          })
          .eq("id", doc.id);

        // Log to ocr_processing_logs
        await supabase.from("ocr_processing_logs").insert({
          document_id: doc.id,
          case_id: doc.case_id,
          status: "failed",
          error_message: error instanceof Error ? error.message : "Unknown error",
          retry_count: newRetryCount,
        });

        results.push({
          documentId: doc.id,
          name: doc.name,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
          retryCount: newRetryCount,
        });
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

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
