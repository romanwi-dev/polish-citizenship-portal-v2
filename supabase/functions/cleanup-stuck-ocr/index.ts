import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PROCESSING_TIMEOUT_MINUTES = 5;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    }
  );

  console.log("[cleanup-stuck-ocr] Starting cleanup of stuck OCR documents...");

  try {
    const timeoutThreshold = new Date(Date.now() - PROCESSING_TIMEOUT_MINUTES * 60 * 1000).toISOString();
    
    // Find stuck documents
    const { data: stuckDocs, error: fetchError } = await supabase
      .from("documents")
      .select("id, name, updated_at, ocr_retry_count, case_id")
      .eq("ocr_status", "processing")
      .lt("updated_at", timeoutThreshold);

    if (fetchError) {
      console.error("❌ Error fetching stuck documents:", fetchError);
      throw fetchError;
    }

    if (!stuckDocs || stuckDocs.length === 0) {
      console.log("✅ No stuck documents found");
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "No stuck documents found",
          cleaned: 0
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`⚠️  Found ${stuckDocs.length} stuck documents`);

    const results = [];
    
    for (const doc of stuckDocs) {
      const retryCount = (doc.ocr_retry_count || 0) + 1;
      const newStatus = retryCount >= 3 ? 'failed' : 'queued';
      
      console.log(`🔄 Resetting ${doc.name} to ${newStatus} (retry ${retryCount}/3)`);
      
      const { error: updateError } = await supabase
        .from("documents")
        .update({ 
          ocr_status: newStatus,
          ocr_retry_count: retryCount,
          ocr_error_message: `Reset from stuck processing state (timeout > ${PROCESSING_TIMEOUT_MINUTES} min)`,
          updated_at: new Date().toISOString()
        })
        .eq("id", doc.id);

      if (updateError) {
        console.error(`❌ Error updating document ${doc.id}:`, updateError);
        results.push({
          documentId: doc.id,
          success: false,
          error: updateError.message
        });
      } else {
        // Log the cleanup action
        await supabase
          .from("ocr_processing_logs")
          .insert({
            document_id: doc.id,
            case_id: doc.case_id,
            started_at: new Date().toISOString(),
            completed_at: new Date().toISOString(),
            status: 'failed',
            error_message: `Cleanup: stuck in processing (timeout > ${PROCESSING_TIMEOUT_MINUTES} min)`,
            duration_ms: 0
          });

        results.push({
          documentId: doc.id,
          success: true,
          newStatus,
          retryCount
        });
      }
    }

    console.log(`✅ Cleanup complete: ${results.filter(r => r.success).length}/${results.length} successful`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        cleaned: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Fatal error in cleanup-stuck-ocr:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
