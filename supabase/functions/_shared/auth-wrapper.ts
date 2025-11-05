/**
 * Authentication wrapper utilities to replace direct service role key usage
 * Ensures all database operations respect Row Level Security (RLS) policies
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Creates an authenticated Supabase client that respects RLS policies
 * Uses the provided auth header to authenticate as the requesting user
 */
export function createAuthenticatedClient(authHeader?: string): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables');
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: authHeader ? { Authorization: authHeader } : {},
    },
  });

  return client;
}

/**
 * Creates a service role client (bypasses RLS)
 * ⚠️ WARNING: Only use for system operations that require elevated privileges
 * Always log when this is used for audit trail
 */
export function createServiceClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
  }

  console.warn('⚠️ Service role client created - bypasses RLS policies. Ensure this is necessary.');

  return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Verifies the authentication header and returns the authenticated user ID
 * Returns null if authentication fails
 */
export async function verifyAuth(authHeader?: string): Promise<{ userId: string; email?: string } | null> {
  if (!authHeader) {
    console.error('No authorization header provided');
    return null;
  }

  const client = createAuthenticatedClient(authHeader);

  try {
    const { data: { user }, error } = await client.auth.getUser();

    if (error) {
      console.error('Authentication verification failed:', error.message);
      return null;
    }

    if (!user) {
      console.error('No user found from auth token');
      return null;
    }

    return {
      userId: user.id,
      email: user.email
    };
  } catch (err) {
    console.error('Exception during auth verification:', err);
    return null;
  }
}

/**
 * Middleware to verify authentication and return appropriate error response
 * Returns null if authenticated, or an error Response if not
 */
export async function requireAuth(
  authHeader: string | null,
  corsHeaders: Record<string, string>
): Promise<{ userId: string; email?: string } | Response> {
  const auth = await verifyAuth(authHeader || undefined);

  if (!auth) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized - valid authentication required' }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  return auth;
}
