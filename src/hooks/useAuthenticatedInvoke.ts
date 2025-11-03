import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to invoke Supabase functions with authenticated session token
 */
export const useAuthenticatedInvoke = () => {
  const invoke = async (functionName: string, body?: any) => {
    // Get current session token
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;
    
    if (!token) {
      return {
        data: null,
        error: {
          message: 'You must be signed in to perform this action',
          code: 'NO_SESSION'
        }
      };
    }
    
    // Invoke function with explicit Authorization header
    return supabase.functions.invoke(functionName, {
      body,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
  };
  
  return { invoke };
};
