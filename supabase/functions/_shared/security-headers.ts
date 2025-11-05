/**
 * Security headers for edge functions
 * Implements CSP, HSTS, and other security best practices
 */

export function getSecurityHeaders(origin: string | null): Record<string, string> {
  const allowedOrigins = new Set(
    (Deno.env.get('ALLOWED_ORIGINS') ?? '').split(',').map(s => s.trim()).filter(Boolean)
  );
  
  // Allow all origins if ALLOWED_ORIGINS is not set, otherwise check against whitelist
  const allowOrigin = origin && (allowedOrigins.size === 0 || allowedOrigins.has(origin)) ? origin : '*';
  
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
    'Vary': 'Origin',
    
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
    
    // Prevent clickjacking
    'X-Frame-Options': 'DENY',
    
    // Prevent MIME sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // XSS Protection
    'X-XSS-Protection': '1; mode=block',
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions Policy
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  };
}

export function createSecureResponse(
  body: any,
  status: number = 200,
  origin: string | null = null
): Response {
  return new Response(
    typeof body === 'string' ? body : JSON.stringify(body),
    {
      status,
      headers: {
        ...getSecurityHeaders(origin),
        'Content-Type': 'application/json',
      },
    }
  );
}
