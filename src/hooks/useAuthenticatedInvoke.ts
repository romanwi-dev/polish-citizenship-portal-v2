import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to invoke Supabase functions with authenticated session token
 */
export const useAuthenticatedInvoke = () => {
  const invoke = async (functionName: string, body?: any) => {
    // Get current session token
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    console.log('[AUTH-INVOKE] Session check:', {
      hasSession: !!sessionData?.session,
      hasToken: !!sessionData?.session?.access_token,
      sessionError: sessionError?.message,
      user: sessionData?.session?.user?.email
    });
    
    const token = sessionData?.session?.access_token;
    
    if (!token) {
      console.error('[AUTH-INVOKE] No session token available');
      return {
        data: null,
        error: {
          message: 'You must be signed in to perform this action. Please log in and try again.',
          code: 'NO_SESSION'
        }
      };
    }
    
    console.log('[AUTH-INVOKE] Invoking function:', functionName, 'with auth');
    
    // Invoke function with explicit Authorization header
    const result = await supabase.functions.invoke(functionName, {
      body,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('[AUTH-INVOKE] Result:', {
      hasData: !!result.data,
      hasError: !!result.error,
      error: result.error?.message
    });
    
    return result;
  };
  
  return { invoke };
};
