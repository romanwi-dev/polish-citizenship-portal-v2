import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PDF_TEMPLATES = [
  { id: "poa-adult", name: "POA - Adult" },
  { id: "poa-minor", name: "POA - Minor" },
  { id: "poa-spouses", name: "POA - Spouses" },
  { id: "citizenship", name: "Citizenship Application" },
  { id: "family-tree", name: "Family Tree" },
  { id: "uzupelnienie", name: "Uzupełnienie" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId, draft = true } = await req.json();

    if (!caseId) {
      throw new Error("Case ID is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log(`Generating ${draft ? 'draft' : 'final'} PDFs for case: ${caseId}`);

    // Fetch case data with master_table
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("*, master_table(*)")
      .eq("id", caseId)
      .single();

    if (caseError) throw caseError;

    const results = [];
    const folder = draft ? "draft" : "final";

    // Generate each PDF by calling fill-pdf edge function
    for (const template of PDF_TEMPLATES) {
      try {
        console.log(`Generating ${template.id} PDF...`);
        
        const { data: pdfData, error: pdfError } = await supabase.functions.invoke("fill-pdf", {
          body: {
            caseId,
            templateType: template.id,
            draft: true, // Always generate as draft first
          },
        });

        if (pdfError) {
          console.error(`Error generating ${template.id}:`, pdfError);
          results.push({
            templateId: template.id,
            name: template.name,
            status: "error",
            error: pdfError.message,
          });
          continue;
        }

        if (!pdfData?.pdfBase64) {
          throw new Error(`No PDF data returned for ${template.id}`);
        }

        // Store PDF in storage bucket
        const fileName = `${folder}/${caseId}/${template.id}_${Date.now()}.pdf`;
        const pdfBuffer = Uint8Array.from(atob(pdfData.pdfBase64), c => c.charCodeAt(0));

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("document-pdfs")
          .upload(fileName, pdfBuffer, {
            contentType: "application/pdf",
            upsert: true,
          });

        if (uploadError) {
          console.error(`Upload error for ${template.id}:`, uploadError);
          results.push({
            templateId: template.id,
            name: template.name,
            status: "error",
            error: uploadError.message,
          });
          continue;
        }

        // Generate signed URL (24 hour expiry)
        const { data: urlData } = await supabase.storage
          .from("document-pdfs")
          .createSignedUrl(fileName, 86400);

        results.push({
          templateId: template.id,
          name: template.name,
          status: "ready",
          url: urlData?.signedUrl || null,
          path: fileName,
          fieldsPopulated: pdfData.fieldsPopulated || 0,
          totalFields: pdfData.totalFields || 0,
        });

        console.log(`✅ ${template.id} PDF generated successfully`);
      } catch (error: any) {
        console.error(`Exception for ${template.id}:`, error);
        results.push({
          templateId: template.id,
          name: template.name,
          status: "error",
          error: error.message,
        });
      }
    }

    // Update workflow instance status
    const { data: workflowData } = await supabase
      .from("workflow_instances")
      .select("id")
      .eq("case_id", caseId)
      .eq("workflow_type", "ai_documents")
      .single();

    if (workflowData?.id) {
      const successCount = results.filter(r => r.status === "ready").length;
      const status = successCount === PDF_TEMPLATES.length ? "completed" : 
                     successCount > 0 ? "generating" : "failed";

      await supabase
        .from("workflow_instances")
        .update({ pdf_generation_status: status })
        .eq("id", workflowData.id);
    }

    // Log to HAC
    await supabase.from("hac_logs").insert({
      case_id: caseId,
      action_type: "pdf_generation",
      action_description: `Generated ${results.filter(r => r.status === "ready").length}/${PDF_TEMPLATES.length} PDFs`,
      field_changed: "pdf_generation_status",
      new_value: JSON.stringify(results),
    });

    const successCount = results.filter(r => r.status === "ready").length;

    return new Response(
      JSON.stringify({
        success: true,
        results,
        summary: {
          total: PDF_TEMPLATES.length,
          successful: successCount,
          failed: PDF_TEMPLATES.length - successCount,
        },
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: any) {
    console.error("Error generating PDFs:", error);

    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
