import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId, clientEmail, clientName } = await req.json();

    if (!caseId || !clientEmail) {
      return new Response(
        JSON.stringify({ error: "caseId and clientEmail required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Generate intake token
    const timestamp = Date.now();
    const randomString = crypto.randomUUID().split("-")[0];
    const intakeToken = `case_${caseId}_${timestamp}_${randomString}`;

    // Store token in client_portal_access
    const { error: accessError } = await supabase
      .from("client_portal_access")
      .insert({
        case_id: caseId,
        magic_link_token: intakeToken,
        magic_link_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });

    if (accessError) throw accessError;

    // Generate intake URL
    const baseUrl = Deno.env.get("SUPABASE_URL")?.replace(/\.supabase\.co.*/, ".lovable.app") || "http://localhost:8080";
    const intakeUrl = `${baseUrl}/intake/${intakeToken}`;

    // TODO: Integrate with Resend or SendGrid for actual email sending
    // For now, log the email details
    console.log("Welcome email details:", {
      to: clientEmail,
      subject: "Welcome to Polish Citizenship Portal",
      intakeUrl,
      clientName: clientName || "Client",
    });

    // Return success with intake URL for testing
    return new Response(
      JSON.stringify({
        success: true,
        intakeUrl,
        message: "Welcome email would be sent (email integration pending)",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Send welcome email error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
