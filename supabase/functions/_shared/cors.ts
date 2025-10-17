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
if (Deno.env.get('FRONTEND_PROD_URL')) {
  allowedOrigins.push(Deno.env.get('FRONTEND_PROD_URL')!);
}

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
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Legacy export for backwards compatibility
 * Note: This uses wildcard and should be replaced with getCorsHeaders
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Handle CORS preflight requests with origin validation
 * Returns a Response if it's an OPTIONS request, null otherwise
 */
export function handleCorsPreflight(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    const origin = req.headers.get('Origin');
    return new Response('ok', { headers: getCorsHeaders(origin) });
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
 */
export function createSecureCorsResponse(
  data: any,
  origin: string | null,
  status: number = 200
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
  });
}

/**
 * Create an error response with validated CORS headers based on origin
 */
export function createSecureErrorResponse(
  error: string,
  origin: string | null,
  status: number = 500
): Response {
  return new Response(
    JSON.stringify({ error }),
    {
      status,
      headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
    }
  );
}
