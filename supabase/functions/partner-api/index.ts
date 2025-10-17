import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

const VALID_API_KEYS = new Set([
  Deno.env.get("PARTNER_API_KEY_1"),
  Deno.env.get("PARTNER_API_KEY_2"),
].filter(Boolean));

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API key
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey || !VALID_API_KEYS.has(apiKey)) {
      return new Response(
        JSON.stringify({ error: "Invalid API key" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const url = new URL(req.url);
    const pathname = url.pathname.replace("/partner-api", "");

    // POST /intake - Create new case with intake data
    if (req.method === "POST" && pathname === "/intake") {
      const body = await req.json();
      const { clientName, email, phone, country, intakeData } = body;

      // Input validation
      const { sanitizeName, isValidEmail, checkRateLimit } = await import('../_shared/validation.ts');

      // Rate limiting by API key
      const rateLimit = checkRateLimit(`partner-${apiKey}`, 100, 60000);
      if (!rateLimit.allowed) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded', retryAfter: rateLimit.retryAfter }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const sanitizedName = sanitizeName(clientName);
      if (!sanitizedName) {
        return new Response(
          JSON.stringify({ error: 'Invalid client name' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (email && !isValidEmail(email)) {
        return new Response(
          JSON.stringify({ error: 'Invalid email format' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Create case with sanitized data
      const { data: caseData, error: caseError } = await supabase
        .from("cases")
        .insert({
          client_name: sanitizedName,
          country: country || "Unknown",
          status: "lead",
        })
        .select()
        .single();

      if (caseError) throw caseError;

      // Create intake data
      const { error: intakeError } = await supabase
        .from("intake_data")
        .insert({
          case_id: caseData.id,
          email,
          phone,
          ...intakeData,
        });

      if (intakeError) throw intakeError;

      return new Response(
        JSON.stringify({
          success: true,
          caseId: caseData.id,
          clientCode: caseData.client_code,
        }),
        { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // GET /status/:caseId - Get case status
    if (req.method === "GET" && pathname.startsWith("/status/")) {
      const caseId = pathname.split("/")[2];

      // Input validation
      const { isValidUUID } = await import('../_shared/validation.ts');
      
      if (!isValidUUID(caseId)) {
        return new Response(
          JSON.stringify({ error: 'Invalid case ID format' }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: caseData, error: caseError } = await supabase
        .from("cases")
        .select("id, client_code, status, current_stage, progress, created_at, updated_at")
        .eq("id", caseId)
        .single();

      if (caseError) throw caseError;

      return new Response(
        JSON.stringify(caseData),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Endpoint not found" }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Partner API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
