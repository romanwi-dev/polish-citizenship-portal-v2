import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Scan and queue ONLY uploaded documents (not all Dropbox files)
 * This function is specifically for the AI Workflow to process
 * only the documents that were uploaded through the workflow interface
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { caseId, documentIds } = await req.json();

    if (!caseId) {
      throw new Error("caseId is required");
    }

    console.log(`[scan-uploaded-documents] Processing case: ${caseId}`);
    console.log(`[scan-uploaded-documents] Document IDs: ${documentIds?.length || 'all uploaded'}`);

    // Query documents that:
    // 1. Belong to this case
    // 2. Have been uploaded (have dropbox_path)
    // 3. Are OCR-able file types
    // 4. Haven't been processed yet (ocr_status is null, 'pending', or 'queued')
    // 5. Optionally: match specific document IDs if provided
    
    let query = supabase
      .from("documents")
      .select("*")
      .eq("case_id", caseId)
      .not("dropbox_path", "is", null)
      .in("file_extension", [".pdf", ".jpg", ".jpeg", ".png", ".tiff", ".tif", ".bmp"])
      .in("ocr_status", ["pending", "queued", null]);

    // If specific document IDs provided, filter to only those
    if (documentIds && Array.isArray(documentIds) && documentIds.length > 0) {
      query = query.in("id", documentIds);
    }

    const { data: documents, error: fetchError } = await query;

    if (fetchError) {
      throw fetchError;
    }

    console.log(`[scan-uploaded-documents] Found ${documents?.length || 0} documents to process`);

    if (!documents || documents.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No documents to process",
          queued: 0,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Update OCR status to 'queued' for all documents
    const queued = [];
    const failed = [];

    for (const doc of documents) {
      try {
        const { error: updateError } = await supabase
          .from("documents")
          .update({
            ocr_status: "queued",
            ocr_retry_count: 0,
          })
          .eq("id", doc.id);

        if (updateError) {
          console.error(`Failed to queue ${doc.name}:`, updateError);
          failed.push({ id: doc.id, name: doc.name, error: updateError.message });
        } else {
          console.log(`✓ Queued: ${doc.name}`);
          queued.push({ id: doc.id, name: doc.name });
        }
      } catch (err: any) {
        console.error(`Error queuing ${doc.name}:`, err);
        failed.push({ id: doc.id, name: doc.name, error: err.message });
      }
    }

    // Trigger OCR worker to process the queued documents
    try {
      console.log("[scan-uploaded-documents] Triggering OCR worker...");
      await supabase.functions.invoke("ocr-worker", {
        body: { trigger: "scan-complete", caseId },
      });
    } catch (err: any) {
      console.error("[scan-uploaded-documents] Failed to trigger OCR worker:", err);
    }

    return new Response(
      JSON.stringify({
        success: true,
        queued: queued.length,
        failed: failed.length,
        documents: queued,
        errors: failed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("[scan-uploaded-documents] Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
