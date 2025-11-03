import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { json, corsHeaders } from '../_shared/cors.ts';
import { isValidEmail, sanitizeString, validateRequestBody, isValidUUID } from '../_shared/inputValidation.ts';
import { checkRateLimit, RATE_LIMITS, getRequestIdentifier, rateLimitResponse } from '../_shared/rateLimiting.ts';

interface MagicLinkRequest {
  email: string;
  caseId: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders(req.headers.get('Origin')) });
  }

  try {
    const body = await req.json();
    
    // Validate request body structure
    const validation = validateRequestBody(body, ['email', 'caseId']);
    if (!validation.valid) {
      return json(req, { error: validation.error }, 400);
    }

    // Sanitize and validate inputs
    const email = sanitizeString(body.email, 255).toLowerCase();
    const caseId = sanitizeString(body.caseId, 36);

    // Input validation
    if (!isValidEmail(email)) {
      return json(req, { error: 'Valid email is required' }, 400);
    }

    if (!isValidUUID(caseId)) {
      return json(req, { error: 'Valid case ID is required' }, 400);
    }

    // Rate limit by email (3 attempts per hour)
    const emailIdentifier = `email:${email}`;
    const emailRateLimit = await checkRateLimit({
      ...RATE_LIMITS.MAGIC_LINK,
      identifier: emailIdentifier
    });

    if (!emailRateLimit.allowed) {
      console.log(`Magic link rate limit exceeded for identifier:`, emailIdentifier.substring(0, 15));
      return rateLimitResponse(emailRateLimit);
    }

    // Rate limit by IP (10 attempts per hour - prevents distributed attacks)
    const ipIdentifier = await getRequestIdentifier(req);
    const ipRateLimit = await checkRateLimit({
      ...RATE_LIMITS.MAGIC_LINK_IP,
      identifier: ipIdentifier
    });

    if (!ipRateLimit.allowed) {
      console.log(`Magic link rate limit exceeded for IP: ${ipIdentifier}`);
      return rateLimitResponse(ipRateLimit);
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

      return json(req, { error: 'No access to this case' }, 403);
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

    console.log('Magic link generated for case:', caseId);

    return json(req, {
      success: true,
      message: 'Magic link sent to your email'
    }, 200);

  } catch (error) {
    console.error('Magic link error:', error);
    return json(
      req,
      { error: error instanceof Error ? error.message : 'Failed to send magic link' },
      500
    );
  }
});
