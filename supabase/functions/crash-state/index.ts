import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { action, sessionId, crashData, errorMessage, componentStack } = await req.json();

    // Get user if authenticated (optional)
    const { data: { user } } = await supabaseClient.auth.getUser();

    if (action === 'save') {
      // Save crash state server-side (replaces client-side HMAC)
      const { data, error } = await supabaseClient
        .from('crash_states')
        .upsert({
          user_id: user?.id || null,
          session_id: sessionId,
          crash_data: crashData,
          error_message: errorMessage,
          component_stack: componentStack,
          url: crashData?.url || null,
          user_agent: crashData?.userAgent || null,
        }, {
          onConflict: 'session_id,user_id'
        })
        .select()
        .single();

      if (error) throw error;

      return new Response(
        JSON.stringify({ success: true, crashStateId: data.id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'recover') {
      // Recover crash state server-side with automatic expiration
      const { data, error } = await supabaseClient
        .from('crash_states')
        .select('*')
        .eq('session_id', sessionId)
        .is('recovered_at', null)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Mark as recovered
        await supabaseClient
          .from('crash_states')
          .update({ recovered_at: new Date().toISOString() })
          .eq('id', data.id);

        return new Response(
          JSON.stringify({
            success: true,
            crashState: {
              crashData: data.crash_data,
              errorMessage: data.error_message,
              componentStack: data.component_stack,
              createdAt: data.created_at,
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, crashState: null }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'clear') {
      // Clear crash state
      await supabaseClient
        .from('crash_states')
        .delete()
        .eq('session_id', sessionId);

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  } catch (error) {
    console.error('[crash-state] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
