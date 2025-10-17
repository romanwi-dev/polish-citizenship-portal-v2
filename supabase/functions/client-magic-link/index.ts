import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCorsPreflight, createCorsResponse, createErrorResponse } from '../_shared/cors.ts';
import { isValidEmail, sanitizeString, validateRequestBody, isValidUUID } from '../_shared/inputValidation.ts';

interface MagicLinkRequest {
  email: string;
  caseId: string;
}

Deno.serve(async (req) => {
  const preflightResponse = handleCorsPreflight(req);
  if (preflightResponse) return preflightResponse;

  try {
    const body = await req.json();
    
    // Validate request body structure
    const validation = validateRequestBody(body, ['email', 'caseId']);
    if (!validation.valid) {
      return createErrorResponse(validation.error!, 400);
    }

    // Sanitize and validate inputs
    const email = sanitizeString(body.email, 255).toLowerCase();
    const caseId = sanitizeString(body.caseId, 36);

    // Input validation
    if (!isValidEmail(email)) {
      return createErrorResponse('Valid email is required', 400);
    }

    if (!isValidUUID(caseId)) {
      return createErrorResponse('Valid case ID is required', 400);
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

      return createErrorResponse('No access to this case', 403);
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

      return createErrorResponse('Too many login attempts. Please try again later.', 429);
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

    return createCorsResponse({
      success: true,
      message: 'Magic link sent to your email'
    }, 200);

  } catch (error) {
    console.error('Magic link error:', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to send magic link',
      500
    );
  }
});
