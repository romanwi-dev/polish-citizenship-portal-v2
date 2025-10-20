import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, typeform-signature',
};

interface TypeformAnswer {
  field: {
    id: string;
    type: string;
    ref: string;
  };
  type: string;
  text?: string;
  email?: string;
  phone_number?: string;
  choice?: {
    label: string;
  };
  date?: string;
}

interface TypeformWebhook {
  event_id: string;
  event_type: string;
  form_response: {
    form_id: string;
    token: string;
    landed_at: string;
    submitted_at: string;
    answers: TypeformAnswer[];
  };
}

/**
 * Verify Typeform webhook signature to prevent unauthorized requests
 */
async function verifyTypeformSignature(
  payload: string,
  signature: string | null,
  secret: string
): Promise<boolean> {
  if (!signature) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signatureBytes = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(payload)
  );

  const computedSignature = btoa(String.fromCharCode(...new Uint8Array(signatureBytes)));
  
  // Remove 'sha256=' prefix from Typeform signature if present
  const cleanSignature = signature.replace(/^sha256=/, '');
  
  return computedSignature === cleanSignature;
}

/**
 * Sanitize string to prevent XSS and enforce length limits
 */
function sanitizeString(input: string, maxLength: number = 1000): string {
  if (!input) return '';
  let sanitized = input.trim();
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }
  sanitized = sanitized.replace(/\0/g, '');
  return sanitized;
}

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Received Typeform webhook');

    // Get raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get('typeform-signature');
    const webhookSecret = Deno.env.get('TYPEFORM_WEBHOOK_SECRET');

    // Verify Typeform signature
    if (webhookSecret) {
      const isValid = await verifyTypeformSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error('Invalid Typeform signature');
        return new Response(
          JSON.stringify({ error: 'Invalid signature' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401,
          }
        );
      }
      console.log('Typeform signature verified ✓');
    } else {
      console.warn('TYPEFORM_WEBHOOK_SECRET not set - signature verification skipped');
    }

    const payload: TypeformWebhook = JSON.parse(rawBody);
    
    if (!payload.form_response || !payload.form_response.answers) {
      throw new Error('Invalid Typeform payload');
    }

    const answers = payload.form_response.answers;
    
    // Extract data from Typeform answers
    const findAnswer = (ref: string) => {
      const answer = answers.find(a => a.field.ref === ref);
      return answer?.text || answer?.email || answer?.phone_number || answer?.choice?.label || answer?.date || '';
    };

    // Map and validate Typeform fields
    const firstName = sanitizeString(findAnswer('first_name'), 100);
    const lastName = sanitizeString(findAnswer('last_name'), 100);
    const emailRaw = findAnswer('email');
    const email = emailRaw && isValidEmail(emailRaw) ? emailRaw.toLowerCase().trim() : '';
    const phone = sanitizeString(findAnswer('phone'), 50);
    const country = sanitizeString(findAnswer('country'), 100) || 'Unknown';
    const dateOfBirth = findAnswer('date_of_birth') || '';

    // Validate required fields
    if (!firstName || !lastName) {
      throw new Error('First name and last name are required');
    }

    if (email && !isValidEmail(email)) {
      console.warn('Invalid email format in Typeform submission:', emailRaw);
    }

    console.log(`Processing lead: ${firstName} ${lastName} from ${country}`);

    // Generate unique LEAD case code
    const { data: existingLeads, error: countError } = await supabaseClient
      .from('cases')
      .select('client_code')
      .like('client_code', 'LEAD-%')
      .order('created_at', { ascending: false })
      .limit(1);

    if (countError) throw countError;

    let leadNumber = 1;
    if (existingLeads && existingLeads.length > 0) {
      const lastCode = existingLeads[0].client_code;
      const match = lastCode.match(/LEAD-(\d+)/);
      if (match) {
        leadNumber = parseInt(match[1]) + 1;
      }
    }

    const clientCode = `LEAD-${leadNumber.toString().padStart(3, '0')}`;
    const clientName = `${firstName} ${lastName}`.trim() || 'Unknown Client';

    // Create new case
    const { data: newCase, error: caseError } = await supabaseClient
      .from('cases')
      .insert({
        client_name: clientName,
        client_code: clientCode,
        country: country,
        status: 'lead',
        generation: 'G3',
        is_vip: false,
        progress: 5,
        dropbox_path: `/CASES/${clientCode}`,
        notes: `Lead from Typeform - Submitted: ${payload.form_response.submitted_at}`,
        processing_mode: 'DBGK'
      })
      .select()
      .single();

    if (caseError) throw caseError;

    console.log(`Created case: ${clientCode} (ID: ${newCase.id})`);

    // Create intake data record
    const intakeData: any = {
      case_id: newCase.id,
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      date_of_birth: dateOfBirth,
      country_of_birth: country,
      language_preference: 'EN',
      source: 'typeform',
      completed: false,
      completion_percentage: 15
    };

    // Map additional Typeform fields with sanitization
    const fatherFirstName = sanitizeString(findAnswer('father_first_name'), 100);
    const motherFirstName = sanitizeString(findAnswer('mother_first_name'), 100);
    const passportNumber = sanitizeString(findAnswer('passport_number'), 50);
    
    if (fatherFirstName) intakeData.father_first_name = fatherFirstName;
    if (motherFirstName) intakeData.mother_first_name = motherFirstName;
    if (passportNumber) intakeData.passport_number = passportNumber;

    const { error: intakeError } = await supabaseClient
      .from('intake_data')
      .insert(intakeData);

    if (intakeError) {
      console.error('Intake data error:', intakeError);
      // Don't throw - case is already created
    }

    // Create initial task to review the lead
    const { error: taskError } = await supabaseClient
      .from('tasks')
      .insert({
        case_id: newCase.id,
        title: 'Review New Typeform Lead',
        description: `New lead from Typeform: ${clientName}\nEmail: ${email}\nPhone: ${phone}\nCountry: ${country}\n\nReview and contact client for initial consultation.`,
        category: 'intake',
        priority: 'high',
        status: 'pending',
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days
      });

    if (taskError) {
      console.error('Task creation error:', taskError);
      // Don't throw - case is already created
    }

    console.log(`Typeform lead processed successfully: ${clientCode}`);

    return new Response(
      JSON.stringify({
        success: true,
        case_id: newCase.id,
        client_code: clientCode,
        client_name: clientName,
        message: 'Lead created successfully from Typeform submission'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Typeform webhook error:', error);

    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to process Typeform submission'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
