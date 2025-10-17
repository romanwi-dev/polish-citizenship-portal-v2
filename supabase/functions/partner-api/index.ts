import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, handleCorsPreflight, createCorsResponse, createErrorResponse } from '../_shared/cors.ts';
import { sanitizeString, isValidEmail, isValidUUID, validateRequestBody, sanitizeObject } from '../_shared/inputValidation.ts';

const VALID_API_KEYS = new Set([
  Deno.env.get("PARTNER_API_KEY_1"),
  Deno.env.get("PARTNER_API_KEY_2"),
].filter(Boolean));

// Rate limiting implementation
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxRequests = 100, windowMs = 60000): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const limit = rateLimitMap.get(key);
  
  // Clean up expired entries
  if (limit && now > limit.resetAt) {
    rateLimitMap.delete(key);
  }
  
  const existing = rateLimitMap.get(key);
  
  if (!existing) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true };
  }
  
  if (existing.count >= maxRequests) {
    const retryAfter = Math.ceil((existing.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }
  
  existing.count++;
  return { allowed: true };
}

serve(async (req) => {
  const preflightResponse = handleCorsPreflight(req);
  if (preflightResponse) return preflightResponse;

  try {
    // Validate API key
    const apiKey = req.headers.get("x-api-key");
    if (!apiKey || !VALID_API_KEYS.has(apiKey)) {
      return createErrorResponse("Invalid API key", 401);
    }
    
    // Rate limiting
    const rateLimitResult = checkRateLimit(`partner-${apiKey}`, 100, 60000);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: "Rate limit exceeded", 
          retryAfter: rateLimitResult.retryAfter 
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": String(rateLimitResult.retryAfter)
          } 
        }
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
      
      // Validate request structure
      const validation = validateRequestBody(body, ['clientName']);
      if (!validation.valid) {
        return createErrorResponse(validation.error!, 400);
      }

      // Sanitize inputs
      const clientName = sanitizeString(body.clientName, 200);
      const email = body.email ? sanitizeString(body.email, 255).toLowerCase() : null;
      const phone = body.phone ? sanitizeString(body.phone, 50) : null;
      const country = body.country ? sanitizeString(body.country, 100) : "Unknown";
      const intakeData = body.intakeData ? sanitizeObject(body.intakeData) : {};

      // Validate client name
      if (!clientName || clientName.length < 2) {
        return createErrorResponse('Invalid client name - must be at least 2 characters', 400);
      }

      // Validate email if provided
      if (email && !isValidEmail(email)) {
        return createErrorResponse('Invalid email format', 400);
      }

      // Create case with sanitized data
      const { data: caseData, error: caseError } = await supabase
        .from("cases")
        .insert({
          client_name: clientName,
          country,
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

      return createCorsResponse({
        success: true,
        caseId: caseData.id,
        clientCode: caseData.client_code,
      }, 201);
    }

    // GET /status/:caseId - Get case status
    if (req.method === "GET" && pathname.startsWith("/status/")) {
      const caseId = pathname.split("/")[2];

      // Input validation
      if (!isValidUUID(caseId)) {
        return createErrorResponse('Invalid case ID format', 400);
      }

      const { data: caseData, error: caseError } = await supabase
        .from("cases")
        .select("id, client_code, status, current_stage, progress, created_at, updated_at")
        .eq("id", caseId)
        .single();

      if (caseError) throw caseError;

      return createCorsResponse(caseData, 200);
    }

    return createErrorResponse("Endpoint not found", 404);
  } catch (error) {
    console.error("Partner API error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse(errorMessage, 500);
  }
});
