import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId, templateType } = await req.json();
    
    if (!caseId || !templateType) {
      throw new Error('caseId and templateType are required');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log(`Filling PDF template: ${templateType} for case: ${caseId}`);

    // Get master data
    const { data: masterData, error: masterError } = await supabaseClient
      .from('master_table')
      .select('*')
      .eq('case_id', caseId)
      .maybeSingle();

    if (masterError) throw masterError;
    if (!masterData) throw new Error('Master data not found');

    // Map template type to public template files
    const templateFileMap: Record<string, string> = {
      'family-tree': 'family-tree.pdf',
      'poa-adult': 'poa-adult.pdf',
      'poa-minor': 'poa-minor.pdf',
      'poa-spouses': 'poa-spouses.pdf',
      'registration': 'registration.pdf',
      'uzupelnienie': 'uzupelnienie.pdf',
      'citizenship': 'citizenship.pdf',
    };

    const templateFileName = templateFileMap[templateType];
    if (!templateFileName) {
      throw new Error(`Unknown template type: ${templateType}`);
    }

    // Fetch template from public folder via project URL
    const projectUrl = Deno.env.get('SUPABASE_URL')?.replace('https://oogmuakyqadpynnrasnd.supabase.co', 'https://98b4e1c7-7682-4f23-9f68-2a61bbec99a9.lovableproject.com') || '';
    const templateUrl = `${projectUrl}/templates/${templateFileName}`;
    console.log(`Fetching template from: ${templateUrl}`);

    // Fetch template from public URL
    const templateResponse = await fetch(templateUrl);

    if (!templateResponse.ok) {
      const errorText = await templateResponse.text();
      console.error(`Template fetch failed: ${templateResponse.status} - ${errorText}`);
      throw new Error(`Failed to fetch template: ${templateResponse.statusText}`);
    }
    
    const templateBytes = await templateResponse.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();

    // Map data to PDF fields based on template type
    const fieldMappings = getFieldMappings(templateType, masterData);
    
    // Name fields that should auto-size
    const nameFields = [
      'imie_nazwisko_wniosko',
      'imie_nazwisko_dziecka',
      'applicant_full_name',
      'applicant_spouse_full_name_and_maiden_name',
      'minor_1_full_name',
      'minor_2_full_name',
      'minor_3_full_name',
      'polish_parent_full_name',
      'applicant_name',
      'father_surname',
      'mother_maiden_name'
    ];
    
    for (const [fieldName, fieldValue] of Object.entries(fieldMappings)) {
      try {
        const field = form.getTextField(fieldName);
        if (field && fieldValue) {
          field.setText(String(fieldValue));
          
          // Enable auto-sizing for name fields
          if (nameFields.includes(fieldName)) {
            field.enableMultiline();
            field.enableReadOnly();
            // Set font size to 0 to enable auto-sizing
            field.setFontSize(0);
          }
        }
      } catch (e) {
        console.log(`Field ${fieldName} not found or error: ${(e as Error).message}`);
      }
    }

    // Flatten the form (make it non-editable)
    form.flatten();

    // Save the filled PDF
    const pdfBytes = await pdfDoc.save();
    
    // Convert to proper ArrayBuffer for Response
    const buffer = new Uint8Array(pdfBytes).buffer;

    return new Response(buffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${templateType}-${caseId}.pdf"`,
      },
    });

  } catch (error) {
    console.error('Error filling PDF:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getFieldMappings(templateType: string, data: any): Record<string, string> {
  const formatDate = (date: string | null) => {
    if (!date) return '';
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  };

  switch (templateType) {
    case 'family-tree':
      return {
        'applicant_full_name': `${data.applicant_first_name || ''} ${data.applicant_last_name || ''}`.trim(),
        'applicant_date_of_birth': formatDate(data.applicant_dob),
        'applicant_place_of_birth': data.applicant_pob || '',
        'applicant_date_of_marriage': formatDate(data.date_of_marriage),
        'applicant_place_of_marriage': data.place_of_marriage || '',
        'applicant_spouse_full_name_and_maiden_name': `${data.spouse_first_name || ''} ${data.spouse_last_name || ''} ${data.spouse_maiden_name ? `(${data.spouse_maiden_name})` : ''}`.trim(),
        
        // Minor children
        'minor_1_full_name': `${data.child_1_first_name || ''} ${data.child_1_last_name || ''}`.trim(),
        'minor_1_date_of_birth': formatDate(data.child_1_dob),
        'minor_1_place_of_birth': data.child_1_pob || '',
        'minor_2_full_name': `${data.child_2_first_name || ''} ${data.child_2_last_name || ''}`.trim(),
        'minor_2_date_of_birth': formatDate(data.child_2_dob),
        'minor_2_place_of_birth': data.child_2_pob || '',
        'minor_3_full_name': `${data.child_3_first_name || ''} ${data.child_3_last_name || ''}`.trim(),
        'minor_3_date_of_birth': formatDate(data.child_3_dob),
        
        // Polish parent (based on ancestry line)
        'polish_parent_full_name': getPolishParentName(data),
        'polish_parent_date_of_birth': getPolishParentDOB(data, formatDate),
        'polish_parent_place_of_birth': getPolishParentPOB(data),
      };

    case 'poa-adult':
    case 'poa-minor':
    case 'poa-spouses':
      return {
        'imie_nazwisko_wniosko': `${data.applicant_first_name || ''} ${data.applicant_last_name || ''}`.trim().toUpperCase(),
        'nr_dok_tozsamosci': (data.applicant_passport_number || '').toUpperCase(),
        'data_pelnomocnictwa': formatDate(data.poa_date_filed || new Date().toISOString()),
        'imie_nazwisko_dziecka': `${data.child_1_first_name || ''} ${data.child_1_last_name || ''}`.trim().toUpperCase(),
      };

    case 'registration':
      return {
        'applicant_name': `${data.applicant_first_name || ''} ${data.applicant_last_name || ''}`.trim(),
        'event_date': formatDate(data.applicant_dob),
        'event_location': data.applicant_pob || '',
      };

    case 'uzupelnienie':
      return {
        'applicant_name': `${data.applicant_first_name || ''} ${data.applicant_last_name || ''}`.trim(),
        'father_surname': data.father_last_name || '',
        'mother_maiden_name': data.mother_maiden_name || '',
      };

    default:
      return {};
  }
}

function getPolishParentName(data: any): string {
  const line = data.ancestry_line;
  if (line === 'father') return `${data.father_first_name || ''} ${data.father_last_name || ''}`.trim();
  if (line === 'mother') return `${data.mother_first_name || ''} ${data.mother_last_name || ''}`.trim();
  if (line === 'pgf') return `${data.pgf_first_name || ''} ${data.pgf_last_name || ''}`.trim();
  if (line === 'pgm') return `${data.pgm_first_name || ''} ${data.pgm_last_name || ''}`.trim();
  if (line === 'mgf') return `${data.mgf_first_name || ''} ${data.mgf_last_name || ''}`.trim();
  if (line === 'mgm') return `${data.mgm_first_name || ''} ${data.mgm_last_name || ''}`.trim();
  return '';
}

function getPolishParentDOB(data: any, formatDate: Function): string {
  const line = data.ancestry_line;
  if (line === 'father') return formatDate(data.father_dob);
  if (line === 'mother') return formatDate(data.mother_dob);
  if (line === 'pgf') return formatDate(data.pgf_dob);
  if (line === 'pgm') return formatDate(data.pgm_dob);
  if (line === 'mgf') return formatDate(data.mgf_dob);
  if (line === 'mgm') return formatDate(data.mgm_dob);
  return '';
}

function getPolishParentPOB(data: any): string {
  const line = data.ancestry_line;
  if (line === 'father') return data.father_pob || '';
  if (line === 'mother') return data.mother_pob || '';
  if (line === 'pgf') return data.pgf_pob || '';
  if (line === 'pgm') return data.pgm_pob || '';
  if (line === 'mgf') return data.mgf_pob || '';
  if (line === 'mgm') return data.mgm_pob || '';
  return '';
}
