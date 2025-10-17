import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, handleCorsPreflight, createCorsResponse, createErrorResponse } from '../_shared/cors.ts';
import { sanitizeString, validateRequestBody } from '../_shared/inputValidation.ts';

// Rate limiting implementation
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxRequests = 50, windowMs = 60000): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const limit = rateLimitMap.get(key);
  
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
    const body = await req.json();
    
    // Validate request body structure
    const validation = validateRequestBody(body, ['token']);
    if (!validation.valid) {
      return createErrorResponse(validation.error!, 400);
    }

    // Sanitize token
    const token = sanitizeString(body.token, 500);

    if (!token) {
      return createErrorResponse("Token required", 400);
    }
    
    // Rate limiting by IP or token
    const clientIP = req.headers.get("x-forwarded-for") || "unknown";
    const rateLimitResult = checkRateLimit(`validate-${clientIP}`, 50, 60000);
    
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          valid: false, 
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

    // Token format: case_{caseId}_{timestamp}_{randomString}
    const parts = token.split("_");
    if (parts.length < 3 || parts[0] !== "case") {
      return createErrorResponse("Invalid token format", 400);
    }

    const caseId = parts[1];
    const timestamp = parseInt(parts[2]);

    // Check if token is expired (7 days)
    const now = Date.now();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    if (now - timestamp > sevenDaysInMs) {
      return createErrorResponse("Token expired", 401);
    }

    // Verify case exists
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("id, client_name")
      .eq("id", caseId)
      .single();

    if (caseError || !caseData) {
      return createErrorResponse("Case not found", 404);
    }

    return createCorsResponse({
      valid: true,
      caseId: caseData.id,
      clientName: caseData.client_name,
    }, 200);
  } catch (error) {
    console.error("Token validation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return createErrorResponse(errorMessage, 500);
  }
});
