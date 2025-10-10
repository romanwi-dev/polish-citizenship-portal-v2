import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const formatDate = (date: string | null) => {
  if (!date) return '';
  try {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  } catch {
    return date;
  }
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

    console.log(`Generating PDF: ${templateType} for case: ${caseId}`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get master data
    const { data: masterData, error: masterError } = await supabaseClient
      .from('master_table')
      .select('*')
      .eq('case_id', caseId)
      .maybeSingle();

    if (masterError) throw masterError;
    if (!masterData) throw new Error('Master data not found');

    console.log('Master data retrieved, loading PDF template...');

    // Load the PDF template
    const templatePath = `./templates/${templateType}.pdf`;
    let pdfBytes: Uint8Array;
    
    try {
      pdfBytes = await Deno.readFile(templatePath);
      console.log(`Loaded template: ${templatePath} (${pdfBytes.length} bytes)`);
    } catch (error) {
      console.error(`Failed to load template: ${templatePath}`, error);
      throw new Error(`Template not found: ${templateType}`);
    }

    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log(`PDF has ${fields.length} form fields`);
    
    // Log all available fields
    fields.forEach(field => {
      const fieldName = field.getName();
      console.log(`Field: ${fieldName}`);
    });

    // Fill the PDF based on template type
    if (templateType === 'poa-adult') {
      // Power of Attorney - Adult fields
      try {
        // Try to fill common fields - these are examples, adjust based on your actual PDF field names
        form.getTextField('firstName')?.setText(masterData.applicant_first_name || '');
        form.getTextField('lastName')?.setText(masterData.applicant_last_name || '');
        form.getTextField('dateOfBirth')?.setText(formatDate(masterData.applicant_dob));
        form.getTextField('placeOfBirth')?.setText(masterData.applicant_pob || '');
        form.getTextField('passportNumber')?.setText(masterData.applicant_passport_number || '');
        form.getTextField('fatherFirstName')?.setText(masterData.father_first_name || '');
        form.getTextField('fatherLastName')?.setText(masterData.father_last_name || '');
        form.getTextField('motherFirstName')?.setText(masterData.mother_first_name || '');
        form.getTextField('motherLastName')?.setText(masterData.mother_last_name || '');
      } catch (e) {
        console.log('Some fields could not be filled:', (e as Error).message);
      }
    } else if (templateType === 'poa-minor') {
      // Power of Attorney - Minor fields
      try {
        form.getTextField('parentFirstName')?.setText(masterData.applicant_first_name || '');
        form.getTextField('parentLastName')?.setText(masterData.father_last_name || '');
        form.getTextField('childFirstName')?.setText(masterData.child_1_first_name || '');
        form.getTextField('childLastName')?.setText(masterData.child_1_last_name || '');
        form.getTextField('childDateOfBirth')?.setText(formatDate(masterData.child_1_dob));
      } catch (e) {
        console.log('Some fields could not be filled:', (e as Error).message);
      }
    } else if (templateType === 'poa-spouses') {
      // Power of Attorney - Spouses fields
      try {
        form.getTextField('husbandFirstName')?.setText(masterData.applicant_first_name || '');
        form.getTextField('husbandLastName')?.setText(masterData.father_last_name || '');
        form.getTextField('wifeFirstName')?.setText(masterData.spouse_first_name || '');
        form.getTextField('wifeLastName')?.setText(masterData.spouse_last_name || '');
      } catch (e) {
        console.log('Some fields could not be filled:', (e as Error).message);
      }
    } else if (templateType === 'citizenship') {
      // Citizenship Application fields
      try {
        form.getTextField('OBY-A-GN')?.setText(masterData.applicant_first_name || '');
        form.getTextField('OBY-A-SN')?.setText(masterData.applicant_last_name || '');
        form.getTextField('OBY-A-BD')?.setText(formatDate(masterData.applicant_dob));
        form.getTextField('OBY-A-BP')?.setText(masterData.applicant_pob || '');
        form.getTextField('OBY-F-GN')?.setText(masterData.father_first_name || '');
        form.getTextField('OBY-F-SN')?.setText(masterData.father_last_name || '');
        form.getTextField('OBY-M-GN')?.setText(masterData.mother_first_name || '');
        form.getTextField('OBY-M-SN')?.setText(masterData.mother_last_name || '');
      } catch (e) {
        console.log('Some fields could not be filled:', (e as Error).message);
      }
    } else if (templateType === 'family-tree') {
      // Family Tree fields
      try {
        console.log('Filling family-tree PDF fields...');
        form.getTextField('applicantName')?.setText(`${masterData.applicant_first_name || ''} ${masterData.applicant_last_name || ''}`.trim());
        form.getTextField('fatherName')?.setText(`${masterData.father_first_name || ''} ${masterData.father_last_name || ''}`.trim());
        form.getTextField('motherName')?.setText(`${masterData.mother_first_name || ''} ${masterData.mother_last_name || ''}`.trim());
        form.getTextField('pgfName')?.setText(`${masterData.pgf_first_name || ''} ${masterData.pgf_last_name || ''}`.trim());
        form.getTextField('pgmName')?.setText(`${masterData.pgm_first_name || ''} ${masterData.pgm_last_name || ''}`.trim());
        form.getTextField('mgfName')?.setText(`${masterData.mgf_first_name || ''} ${masterData.mgf_last_name || ''}`.trim());
        form.getTextField('mgmName')?.setText(`${masterData.mgm_first_name || ''} ${masterData.mgm_last_name || ''}`.trim());
        console.log('Family tree PDF fields filled successfully');
      } catch (e) {
        console.log('Some family tree fields could not be filled:', (e as Error).message);
      }
    } else if (templateType === 'registration') {
      // Civil Registry fields
      try {
        form.getTextField('applicantFirstName')?.setText(masterData.applicant_first_name || '');
        form.getTextField('applicantLastName')?.setText(masterData.applicant_last_name || '');
        form.getTextField('applicantDOB')?.setText(formatDate(masterData.applicant_dob));
        form.getTextField('applicantPOB')?.setText(masterData.applicant_pob || '');
      } catch (e) {
        console.log('Some fields could not be filled:', (e as Error).message);
      }
    } else if (templateType === 'uzupelnienie') {
      // Uzupełnienie fields (supplementary documents)
      try {
        console.log('Filling uzupelnienie PDF fields...');
        form.getTextField('applicantName')?.setText(`${masterData.applicant_first_name || ''} ${masterData.applicant_last_name || ''}`.trim());
        form.getTextField('dateOfBirth')?.setText(formatDate(masterData.applicant_dob));
        console.log('Uzupelnienie PDF fields filled successfully');
      } catch (e) {
        console.log('Some uzupelnienie fields could not be filled:', (e as Error).message);
      }
    } else {
      throw new Error(`Unsupported template type: ${templateType}. Supported types: poa-adult, poa-minor, poa-spouses, citizenship, family-tree, registration, uzupelnienie`);
    }

    // Flatten form (make fields non-editable)
    form.flatten();
    
    const filledPdfBytes = await pdfDoc.save();
    
    console.log(`Successfully generated PDF: ${filledPdfBytes.length} bytes`);
    
    return new Response(filledPdfBytes as any, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${templateType}-${caseId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
