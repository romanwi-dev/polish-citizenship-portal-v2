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

    const payload: TypeformWebhook = await req.json();
    
    if (!payload.form_response || !payload.form_response.answers) {
      throw new Error('Invalid Typeform payload');
    }

    const answers = payload.form_response.answers;
    
    // Extract data from Typeform answers
    const findAnswer = (ref: string) => {
      const answer = answers.find(a => a.field.ref === ref);
      return answer?.text || answer?.email || answer?.phone_number || answer?.choice?.label || answer?.date || '';
    };

    // Map Typeform fields to intake data
    const firstName = findAnswer('first_name') || '';
    const lastName = findAnswer('last_name') || '';
    const email = findAnswer('email') || '';
    const phone = findAnswer('phone') || '';
    const country = findAnswer('country') || 'Unknown';
    const dateOfBirth = findAnswer('date_of_birth') || '';

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

    // Map additional Typeform fields if present
    const fatherFirstName = findAnswer('father_first_name');
    const motherFirstName = findAnswer('mother_first_name');
    const passportNumber = findAnswer('passport_number');
    
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
