/**
 * Shared CORS configuration for all edge functions
 * Centralizes CORS handling to ensure consistent security policy
 */

// Define allowed origins based on environment
const allowedOrigins = [
  'http://localhost:5173', // Local Vite dev server
  'http://localhost:3000', // Alternative local development
  'https://oogmuakyqadpynnrasnd.lovableproject.com', // Lovable preview
];

// Add production URL from environment if available
const frontendProdUrl = Deno.env.get('FRONTEND_PROD_URL');
if (frontendProdUrl) {
  allowedOrigins.push(frontendProdUrl);
}

// Add custom domain if available
const customDomain = Deno.env.get('CUSTOM_DOMAIN');
if (customDomain) {
  allowedOrigins.push(customDomain);
}

console.log('Allowed CORS origins:', allowedOrigins);

/**
 * Get CORS headers based on request origin
 * Only allows requests from whitelisted origins
 */
export function getCorsHeaders(origin: string | null): Record<string, string> {
  // Check if origin is in allowlist
  const allowedOrigin = origin && allowedOrigins.includes(origin) 
    ? origin 
    : allowedOrigins[0]; // Default to first allowed origin

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Secure CORS headers - uses origin validation
 * THIS SHOULD BE THE DEFAULT for all new functions
 */
export function getSecureCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin');
  return getCorsHeaders(origin);
}

/**
 * Legacy export for backwards compatibility
 * WARNING: Uses wildcard and should be migrated to getSecureCorsHeaders
 * @deprecated Use getSecureCorsHeaders instead
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-user-id',
};

/**
 * Handle CORS preflight requests with origin validation
 * Returns a Response if it's an OPTIONS request, null otherwise
 * USE THIS in all new edge functions
 */
export function handleCorsPreflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getSecureCorsHeaders(req) });
  }
  return null;
}

/**
 * Create a JSON response with CORS headers (legacy - uses wildcard)
 */
export function createCorsResponse(
  data: any,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/**
 * Create an error response with CORS headers (legacy - uses wildcard)
 */
export function createErrorResponse(
  error: string,
  status: number = 500
): Response {
  return new Response(
    JSON.stringify({ error }),
    {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Create a JSON response with validated CORS headers based on origin
 * USE THIS in all new edge functions instead of legacy methods
 */
export function createSecureCorsResponse(
  req: Request,
  data: any,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...getSecureCorsHeaders(req), 'Content-Type': 'application/json' },
  });
}

/**
 * Create an error response with validated CORS headers based on origin
 * USE THIS in all new edge functions instead of legacy methods
 */
export function createSecureErrorResponse(
  req: Request,
  error: string,
  status: number = 500
): Response {
  return new Response(
    JSON.stringify({ error }),
    {
      status,
      headers: { ...getSecureCorsHeaders(req), 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Get comprehensive security headers (CSP, XSS protection, etc.)
 * USE THIS for all edge functions to prevent XSS, clickjacking, and other attacks
 */
export function getSecurityHeaders(req: Request): Record<string, string> {
  return {
    ...getSecureCorsHeaders(req),
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://*.lovableproject.com",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  };
}

/**
 * Create a secure JSON response with CSP and security headers
 * USE THIS for all new edge functions
 */
export function createSecureResponse(
  req: Request,
  data: any,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...getSecurityHeaders(req), 'Content-Type': 'application/json' }
  });
}

/**
 * Create a secure error response with CSP and security headers
 * USE THIS for all new edge functions
 */
export function createSecureErrorWithHeaders(
  req: Request,
  error: string,
  status: number = 500
): Response {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { ...getSecurityHeaders(req), 'Content-Type': 'application/json' }
  });
}
