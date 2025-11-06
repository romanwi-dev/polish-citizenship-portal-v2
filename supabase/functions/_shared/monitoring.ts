/**
 * Edge Function Monitoring Utilities
 * Centralized logging and performance tracking for edge functions
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Log edge function call to database
 */
export async function logEdgeFunctionCall(
  functionName: string,
  status: 'start' | 'success' | 'error',
  metadata?: {
    duration_ms?: number;
    error_message?: string;
    [key: string]: any;
  }
) {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('[monitoring] Supabase credentials not configured, skipping log');
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { error } = await supabase
      .from('edge_function_logs')
      .insert({
        function_name: functionName,
        status,
        duration_ms: metadata?.duration_ms,
        error_message: metadata?.error_message,
        metadata: metadata || {},
        timestamp: new Date().toISOString()
      });

    if (error) {
      console.error('[monitoring] Failed to log edge function call:', error);
    }
  } catch (error) {
    // Don't fail the function if logging fails
    console.error('[monitoring] Exception while logging:', error);
  }
}

/**
 * Wrapper to track edge function execution
 */
export async function trackEdgeFunction<T>(
  functionName: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  await logEdgeFunctionCall(functionName, 'start');
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    await logEdgeFunctionCall(functionName, 'success', { duration_ms: duration });
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    await logEdgeFunctionCall(functionName, 'error', {
      duration_ms: duration,
      error_message: errorMessage
    });
    
    throw error;
  }
}
