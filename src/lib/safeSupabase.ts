/**
 * V7 Hardened Supabase Client Wrapper
 * Adds timeout protection and error handling around Supabase calls
 */

import { supabase } from '@/integrations/supabase/client';
import type { PostgrestError } from '@supabase/supabase-js';

const DEFAULT_TIMEOUT = 30000; // 30 seconds

interface SafeQueryResult<T> {
  data: T | null;
  error: PostgrestError | Error | null;
  timedOut: boolean;
}

/**
 * Wrap a Supabase query with timeout protection
 */
export async function withTimeout<T>(
  promise: Promise<{ data: T | null; error: PostgrestError | null }>,
  timeoutMs: number = DEFAULT_TIMEOUT
): Promise<SafeQueryResult<T>> {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  const timeoutPromise = new Promise<SafeQueryResult<T>>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Query timeout after ${timeoutMs}ms`));
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([
      promise.then(res => ({ ...res, timedOut: false })),
      timeoutPromise
    ]);
    clearTimeout(timeoutId);
    return result as SafeQueryResult<T>;
  } catch (error) {
    clearTimeout(timeoutId!);
    return {
      data: null,
      error: error instanceof Error ? error : new Error(String(error)),
      timedOut: true
    };
  }
}

/**
 * Safe wrapper for Supabase auth operations
 */
export const safeAuth = {
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      return { data, error, timedOut: false };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('⚠️ Auth getSession error:', error);
      }
      return {
        data: { session: null },
        error: error instanceof Error ? error : new Error(String(error)),
        timedOut: false
      };
    }
  },

  async getUser() {
    try {
      const { data, error } = await supabase.auth.getUser();
      return { data, error, timedOut: false };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('⚠️ Auth getUser error:', error);
      }
      return {
        data: { user: null },
        error: error instanceof Error ? error : new Error(String(error)),
        timedOut: false
      };
    }
  },

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      return { error, timedOut: false };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('⚠️ Auth signOut error:', error);
      }
      return {
        error: error instanceof Error ? error : new Error(String(error)),
        timedOut: false
      };
    }
  }
};

/**
 * Export the original supabase client for direct use when needed
 */
export { supabase };
