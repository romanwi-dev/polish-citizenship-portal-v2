import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MagicLinkRequest {
  email: string;
  caseId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, caseId }: MagicLinkRequest = await req.json();

    // Input validation
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!caseId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(caseId)) {
      return new Response(
        JSON.stringify({ error: 'Valid case ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Validate that this email has access to this case
    const { data: access, error: accessError } = await supabase
      .from('client_portal_access')
      .select('id, case_id, user_id')
      .eq('case_id', caseId)
      .maybeSingle();

    if (accessError || !access) {
      // Log failed attempt
      await supabase.rpc('log_security_event', {
        p_event_type: 'client_login_attempt',
        p_severity: 'warn',
        p_action: 'magic_link_denied',
        p_details: { email, case_id: caseId, reason: 'no_access' }
      });

      return new Response(
        JSON.stringify({ error: 'No access to this case' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for rate limiting (max 5 attempts per hour per email)
    const oneHourAgo = new Date(Date.now() - 3600000).toISOString();
    const { count } = await supabase
      .from('security_audit_logs')
      .select('id', { count: 'exact' })
      .eq('event_type', 'client_login_attempt')
      .eq('details->>email', email)
      .gte('created_at', oneHourAgo);

    if (count && count >= 5) {
      await supabase.rpc('log_security_event', {
        p_event_type: 'client_login_attempt',
        p_severity: 'high',
        p_action: 'rate_limit_exceeded',
        p_details: { email, case_id: caseId }
      });

      return new Response(
        JSON.stringify({ error: 'Too many login attempts. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate magic link with Supabase Auth
    const siteUrl = Deno.env.get('SITE_URL') || 'https://oogmuakyqadpynnrasnd.supabase.co';
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${siteUrl}/client/dashboard/${caseId}`,
        data: {
          case_id: caseId,
          access_type: 'client_portal'
        }
      }
    });

    if (error) {
      console.error('Magic link generation error:', error);
      throw error;
    }

    // Log successful magic link generation
    await supabase.rpc('log_security_event', {
      p_event_type: 'client_login_attempt',
      p_severity: 'info',
      p_action: 'magic_link_sent',
      p_details: { email, case_id: caseId }
    });

    console.log('Magic link generated for:', email);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Magic link sent to your email'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Magic link error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send magic link'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
