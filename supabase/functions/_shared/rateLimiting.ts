/**
 * Rate Limiting Utility for Edge Functions
 * Prevents abuse by limiting request frequency per user/IP
 */

import { createClient } from "npm:@supabase/supabase-js@2";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  identifier: string; // user_id or ip_address
  endpoint: string; // endpoint name for tracking
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
  retryAfter?: number;
}

/**
 * Check if request should be rate limited
 * Uses database to track request counts across function instances
 */
export async function checkRateLimit(
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const windowStart = new Date(Date.now() - config.windowMs);
  const windowEnd = new Date();

  // Count requests in current window
  const { count, error } = await supabase
    .from('rate_limit_logs')
    .select('*', { count: 'exact', head: true })
    .eq('identifier', config.identifier)
    .eq('endpoint', config.endpoint)
    .gte('created_at', windowStart.toISOString());

  if (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow request if we can't check rate limit
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: new Date(Date.now() + config.windowMs)
    };
  }

  const currentCount = count || 0;
  const remaining = Math.max(0, config.maxRequests - currentCount);

  if (currentCount >= config.maxRequests) {
    // Rate limit exceeded
    return {
      allowed: false,
      remaining: 0,
      resetAt: new Date(Date.now() + config.windowMs),
      retryAfter: Math.ceil(config.windowMs / 1000)
    };
  }

  // Log this request
  await supabase
    .from('rate_limit_logs')
    .insert({
      identifier: config.identifier,
      endpoint: config.endpoint,
      created_at: new Date().toISOString()
    });

  return {
    allowed: true,
    remaining: remaining - 1,
    resetAt: new Date(Date.now() + config.windowMs)
  };
}

/**
 * Standard rate limit configurations
 */
export const RATE_LIMITS = {
  OCR_PROCESSING: {
    maxRequests: 10,
    windowMs: 60000, // 10 requests per minute
    endpoint: 'ocr'
  },
  PDF_GENERATION: {
    maxRequests: 20,
    windowMs: 60000, // 20 requests per minute
    endpoint: 'pdf'
  },
  AI_TRANSLATION: {
    maxRequests: 30,
    windowMs: 60000, // 30 requests per minute
    endpoint: 'ai_translate'
  },
  GENERAL_API: {
    maxRequests: 60,
    windowMs: 60000, // 60 requests per minute
    endpoint: 'api'
  },
  MAGIC_LINK: {
    maxRequests: 3,
    windowMs: 3600000, // 3 attempts per hour per email
    endpoint: 'magic_link'
  },
  MAGIC_LINK_IP: {
    maxRequests: 10,
    windowMs: 3600000, // 10 attempts per hour per IP
    endpoint: 'magic_link_ip'
  }
};

/**
 * Extract user identifier from request
 * Prefers user_id, falls back to IP address
 */
export async function getRequestIdentifier(req: Request): Promise<string> {
  // Try to get user from auth header
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user?.id) {
        return `user:${user.id}`;
      }
    } catch (e) {
      console.error('Failed to get user from token:', e);
    }
  }

  // Fall back to IP address
  const ip = req.headers.get('x-forwarded-for') || 
              req.headers.get('x-real-ip') || 
              'unknown';
  return `ip:${ip}`;
}

/**
 * Create rate limit response
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: 'Rate limit exceeded',
      retryAfter: result.retryAfter,
      resetAt: result.resetAt.toISOString()
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': result.retryAfter?.toString() || '60',
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': result.resetAt.toISOString(),
        'Access-Control-Allow-Origin': '*'
      }
    }
  );
}
