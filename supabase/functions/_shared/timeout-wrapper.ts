/**
 * Timeout Wrapper for Edge Functions
 * Enforces 50-second timeout on all operations with graceful degradation
 */

export interface TimeoutConfig {
  timeoutMs: number;
  operationName: string;
  allowPartialResults?: boolean;
}

export interface TimeoutResult<T> {
  success: boolean;
  data?: T;
  timedOut: boolean;
  duration: number;
  error?: string;
}

/**
 * Execute an async operation with timeout enforcement
 * Returns partial results if available when timeout occurs
 */
export async function withTimeout<T>(
  operation: () => Promise<T>,
  config: TimeoutConfig
): Promise<TimeoutResult<T>> {
  const startTime = Date.now();
  const { timeoutMs, operationName, allowPartialResults = false } = config;

  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Operation '${operationName}' timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    const result = await Promise.race([
      operation(),
      timeoutPromise
    ]);

    const duration = Date.now() - startTime;
    
    console.log(`✓ ${operationName} completed in ${duration}ms`);

    return {
      success: true,
      data: result,
      timedOut: false,
      duration
    };

  } catch (error) {
    const duration = Date.now() - startTime;
    const isTimeout = error instanceof Error && error.message.includes('timed out');

    if (isTimeout) {
      console.error(`⏱️ TIMEOUT: ${operationName} exceeded ${timeoutMs}ms (actual: ${duration}ms)`);
      
      // Log timeout event for monitoring
      logTimeoutEvent(operationName, timeoutMs, duration);

      return {
        success: false,
        timedOut: true,
        duration,
        error: `Operation timed out after ${timeoutMs}ms`
      };
    }

    console.error(`❌ ERROR in ${operationName}:`, error);
    
    return {
      success: false,
      timedOut: false,
      duration,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Log timeout events for monitoring and alerting
 */
function logTimeoutEvent(operation: string, expectedMs: number, actualMs: number): void {
  const event = {
    type: 'timeout',
    operation,
    expected_ms: expectedMs,
    actual_ms: actualMs,
    timestamp: new Date().toISOString()
  };

  console.error('TIMEOUT_EVENT:', JSON.stringify(event));
}

/**
 * Standard timeout configurations
 */
export const TIMEOUTS = {
  EDGE_FUNCTION_MAX: 50000,      // 50 seconds (max for edge functions)
  PDF_GENERATION: 45000,          // 45 seconds for PDF generation
  OCR_PROCESSING: 40000,          // 40 seconds for OCR
  AI_TRANSLATION: 35000,          // 35 seconds for AI operations
  DATABASE_QUERY: 10000,          // 10 seconds for DB queries
  STORAGE_UPLOAD: 20000,          // 20 seconds for file uploads
  EXTERNAL_API: 15000,            // 15 seconds for external API calls
};

/**
 * Wrapper for edge function main handler with automatic timeout
 */
export function wrapEdgeFunction<T>(
  handler: (req: Request) => Promise<Response>,
  functionName: string
): (req: Request) => Promise<Response> {
  return async (req: Request): Promise<Response> => {
    const result = await withTimeout(
      () => handler(req),
      {
        timeoutMs: TIMEOUTS.EDGE_FUNCTION_MAX,
        operationName: functionName
      }
    );

    if (result.timedOut) {
      return new Response(
        JSON.stringify({
          error: 'Request timeout',
          message: 'The operation took too long to complete. Please try again.',
          duration: result.duration,
          timeout: TIMEOUTS.EDGE_FUNCTION_MAX
        }),
        {
          status: 504,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: 'Internal error',
          message: result.error,
          duration: result.duration
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    return result.data as Response;
  };
}
