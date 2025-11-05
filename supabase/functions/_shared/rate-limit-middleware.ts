/**
 * Rate Limiting Middleware - PHASE A Critical Fix
 * Integrates with existing rateLimiting.ts utilities
 * Provides easy-to-use middleware for edge functions
 */

import {
  checkRateLimit,
  rateLimitResponse,
  getRequestIdentifier,
  RATE_LIMITS
} from './rateLimiting.ts';

export interface RateLimitOptions {
  maxRequests: number;
  windowMs: number;
  endpoint: string;
  skipAuth?: boolean; // Skip auth check for public endpoints
}

/**
 * Apply rate limiting to an edge function handler
 * Returns early with 429 if rate limit exceeded
 */
export async function withRateLimit(
  req: Request,
  handler: (req: Request) => Promise<Response>,
  options: RateLimitOptions
): Promise<Response> {
  const startTime = Date.now();

  try {
    // Get identifier (user or IP)
    const identifier = await getRequestIdentifier(req);
    
    console.log(`[Rate Limit] Checking ${options.endpoint} for ${identifier}`);

    // Check rate limit
    const result = await checkRateLimit({
      maxRequests: options.maxRequests,
      windowMs: options.windowMs,
      identifier,
      endpoint: options.endpoint
    });

    // Log for monitoring
    console.log(`[Rate Limit] ${options.endpoint}:`, {
      identifier,
      allowed: result.allowed,
      remaining: result.remaining,
      resetAt: result.resetAt
    });

    if (!result.allowed) {
      console.warn(`[Rate Limit] BLOCKED: ${identifier} exceeded limit on ${options.endpoint}`);
      return rateLimitResponse(result);
    }

    // Execute handler
    const response = await handler(req);

    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetAt.toISOString());

    const duration = Date.now() - startTime;
    console.log(`[Rate Limit] Request completed in ${duration}ms`);

    return response;

  } catch (error) {
    console.error('[Rate Limit] Error in middleware:', error);
    
    // Fail open - if rate limiting fails, allow the request
    // This prevents rate limiting from breaking the entire service
    return handler(req);
  }
}

/**
 * Preset rate limit configurations for common endpoint types
 */
export const PRESET_LIMITS = {
  PDF_GENERATION: {
    maxRequests: RATE_LIMITS.PDF_GENERATION.maxRequests,
    windowMs: RATE_LIMITS.PDF_GENERATION.windowMs,
    endpoint: RATE_LIMITS.PDF_GENERATION.endpoint
  },
  OCR_PROCESSING: {
    maxRequests: RATE_LIMITS.OCR_PROCESSING.maxRequests,
    windowMs: RATE_LIMITS.OCR_PROCESSING.windowMs,
    endpoint: RATE_LIMITS.OCR_PROCESSING.endpoint
  },
  AI_TRANSLATION: {
    maxRequests: RATE_LIMITS.AI_TRANSLATION.maxRequests,
    windowMs: RATE_LIMITS.AI_TRANSLATION.windowMs,
    endpoint: RATE_LIMITS.AI_TRANSLATION.endpoint
  },
  GENERAL: {
    maxRequests: RATE_LIMITS.GENERAL_API.maxRequests,
    windowMs: RATE_LIMITS.GENERAL_API.windowMs,
    endpoint: RATE_LIMITS.GENERAL_API.endpoint
  }
};

/**
 * Quick wrapper for common use case
 */
export function rateLimited(
  preset: keyof typeof PRESET_LIMITS
): (req: Request, handler: (req: Request) => Promise<Response>) => Promise<Response> {
  return (req: Request, handler: (req: Request) => Promise<Response>) => 
    withRateLimit(req, handler, PRESET_LIMITS[preset]);
}
