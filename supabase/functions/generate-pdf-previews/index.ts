import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId } = await req.json();

    if (!caseId) {
      throw new Error("Case ID is required");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch case data
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("*, master_table(*), oby_forms(*), poa(*)")
      .eq("id", caseId)
      .single();

    if (caseError) throw caseError;

    console.log(`Generating PDF previews for case: ${caseId}`);

    // Generate preview PDFs (temporary, not saved to final location)
    // In a real implementation, you would:
    // 1. Call PDF generation functions with draft=true flag
    // 2. Store temporary PDFs in a preview bucket
    // 3. Return signed URLs with short expiry

    // For now, return mock data
    const previews = [
      {
        templateId: "poa_adult",
        url: "https://placeholder-pdf.com/poa_adult_preview.pdf",
        status: "ready"
      },
      {
        templateId: "poa_minor",
        url: "https://placeholder-pdf.com/poa_minor_preview.pdf",
        status: "ready"
      },
      {
        templateId: "poa_spouses",
        url: "https://placeholder-pdf.com/poa_spouses_preview.pdf",
        status: "ready"
      },
      {
        templateId: "citizenship",
        url: "https://placeholder-pdf.com/citizenship_preview.pdf",
        status: "ready"
      },
      {
        templateId: "family_tree",
        url: "https://placeholder-pdf.com/family_tree_preview.pdf",
        status: "ready"
      },
      {
        templateId: "uzupelnienie",
        url: "https://placeholder-pdf.com/uzupelnienie_preview.pdf",
        status: "ready"
      }
    ];

    return new Response(
      JSON.stringify({ 
        success: true, 
        previews,
        message: "Preview PDFs generated successfully (mock data)"
      }),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  } catch (error: any) {
    console.error("Error generating PDF previews:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 400, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        } 
      }
    );
  }
});
