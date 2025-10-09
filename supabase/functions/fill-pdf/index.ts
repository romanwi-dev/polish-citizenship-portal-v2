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

    // Get the request origin to construct the absolute URL
    const origin = req.headers.get('origin') || 'https://98b4e1c7-7682-4f23-9f68-2a61bbec99a9.lovableproject.com';
    
    // Map template type to file name
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

    const templateUrl = `${origin}/templates/${templateFileName}`;
    console.log(`Loading template from: ${templateUrl}`);
    
    // Fetch the template file from public folder
    const templateResponse = await fetch(templateUrl);
    if (!templateResponse.ok) {
      throw new Error(`Failed to fetch template: ${templateResponse.statusText}`);
    }
    
    const templateBytes = await templateResponse.arrayBuffer();
    const pdfDoc = await PDFDocument.load(templateBytes);
    
    // Fill form fields with master data
    await fillFormFields(pdfDoc, templateType, masterData);

    // Save the filled PDF
    const pdfBytes = await pdfDoc.save();
    
    console.log(`PDF generated successfully, size: ${pdfBytes.length} bytes`);
    
    // Return the PDF bytes directly
    return new Response(new Uint8Array(pdfBytes), {
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

async function fillFormFields(pdfDoc: any, templateType: string, data: any) {
  const formatDate = (date: string | null) => {
    if (!date) return '';
    const d = new Date(date);
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  };

  try {
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log(`Found ${fields.length} form fields in ${templateType}`);
    
    // Create field mapping based on template type
    let fieldMapping: Record<string, any> = {};
    
    switch (templateType) {
      case 'poa-adult':
        fieldMapping = {
          'full_name': `${data.applicant_first_name || ''} ${data.applicant_last_name || ''}`.trim(),
          'first_name': data.applicant_first_name || '',
          'last_name': data.applicant_last_name || '',
          'passport_number': data.applicant_passport_number || '',
          'id_number': data.applicant_passport_number || '',
          'date': formatDate(data.poa_date_filed || new Date().toISOString()),
          'date_of_birth': formatDate(data.applicant_dob),
          'place_of_birth': data.applicant_pob || '',
          'address': data.applicant_address?.street || '',
          'city': data.applicant_address?.city || '',
          'country': data.applicant_address?.country || '',
          'email': data.applicant_email || '',
          'phone': data.applicant_phone || '',
        };
        break;
        
      case 'poa-minor':
        fieldMapping = {
          'parent_full_name': `${data.applicant_first_name || ''} ${data.applicant_last_name || ''}`.trim(),
          'parent_first_name': data.applicant_first_name || '',
          'parent_last_name': data.applicant_last_name || '',
          'child_full_name': `${data.child_1_first_name || ''} ${data.child_1_last_name || ''}`.trim(),
          'child_first_name': data.child_1_first_name || '',
          'child_last_name': data.child_1_last_name || '',
          'passport_number': data.applicant_passport_number || '',
          'date': formatDate(data.poa_date_filed || new Date().toISOString()),
        };
        break;
        
      case 'poa-spouses':
        fieldMapping = {
          'spouse1_full_name': `${data.applicant_first_name || ''} ${data.applicant_last_name || ''}`.trim(),
          'spouse2_full_name': `${data.spouse_first_name || ''} ${data.spouse_last_name || ''}`.trim(),
          'date': formatDate(data.poa_date_filed || new Date().toISOString()),
        };
        break;
        
      case 'citizenship':
        fieldMapping = {
          'applicant_first_name': data.applicant_first_name || '',
          'applicant_last_name': data.applicant_last_name || '',
          'applicant_maiden_name': data.applicant_maiden_name || '',
          'date_of_birth': formatDate(data.applicant_dob),
          'place_of_birth': data.applicant_pob || '',
          'father_first_name': data.father_first_name || '',
          'father_last_name': data.father_last_name || '',
          'mother_first_name': data.mother_first_name || '',
          'mother_last_name': data.mother_last_name || '',
          'mother_maiden_name': data.mother_maiden_name || '',
          'address': data.applicant_address?.street || '',
          'city': data.applicant_address?.city || '',
          'postal_code': data.applicant_address?.postal_code || '',
          'country': data.applicant_address?.country || '',
        };
        break;
        
      case 'family-tree':
        fieldMapping = {
          'applicant_name': `${data.applicant_first_name || ''} ${data.applicant_last_name || ''}`.trim(),
          'father_name': `${data.father_first_name || ''} ${data.father_last_name || ''}`.trim(),
          'mother_name': `${data.mother_first_name || ''} ${data.mother_last_name || ''}`.trim(),
          'pgf_name': `${data.pgf_first_name || ''} ${data.pgf_last_name || ''}`.trim(),
          'pgm_name': `${data.pgm_first_name || ''} ${data.pgm_last_name || ''}`.trim(),
          'mgf_name': `${data.mgf_first_name || ''} ${data.mgf_last_name || ''}`.trim(),
          'mgm_name': `${data.mgm_first_name || ''} ${data.mgm_last_name || ''}`.trim(),
        };
        break;
    }
    
    // Fill each field
    fields.forEach((field: any) => {
      const fieldName = field.getName();
      console.log(`Processing field: ${fieldName}`);
      
      // Try exact match first
      if (fieldMapping[fieldName] !== undefined) {
        try {
          const fieldType = field.constructor.name;
          console.log(`Filling ${fieldName} (${fieldType}) with: ${fieldMapping[fieldName]}`);
          
          if (fieldType === 'PDFTextField') {
            field.setText(String(fieldMapping[fieldName] || ''));
          } else if (fieldType === 'PDFCheckBox') {
            if (fieldMapping[fieldName]) {
              field.check();
            } else {
              field.uncheck();
            }
          } else if (fieldType === 'PDFDropdown') {
            field.select(String(fieldMapping[fieldName] || ''));
          }
        } catch (e) {
          console.error(`Error filling field ${fieldName}:`, e);
        }
      } else {
        // Try partial match (case-insensitive)
        const lowerFieldName = fieldName.toLowerCase();
        for (const [key, value] of Object.entries(fieldMapping)) {
          if (lowerFieldName.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerFieldName)) {
            try {
              const fieldType = field.constructor.name;
              console.log(`Filling ${fieldName} via partial match (${fieldType}) with: ${value}`);
              
              if (fieldType === 'PDFTextField') {
                field.setText(String(value || ''));
              }
            } catch (e) {
              console.error(`Error filling field ${fieldName} via partial match:`, e);
            }
            break;
          }
        }
      }
    });
    
    console.log('Form fields filled successfully');
  } catch (error) {
    console.error('Error filling form fields:', error);
    throw error;
  }
}

