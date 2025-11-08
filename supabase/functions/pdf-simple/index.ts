/**
 * SIMPLE PDF GENERATION - NO QUEUES, NO WORKERS, JUST WORKS
 * Generates PDFs synchronously in one request (<10 seconds)
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PDFDocument } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Template mappings
const TEMPLATE_PATHS: Record<string, string> = {
  'poa-adult': 'poa-adult.pdf',
  'poa-minor': 'poa-minor.pdf',
  'poa-spouses': 'poa-spouses.pdf',
  'family-tree': 'family-tree.pdf',
  'citizenship': 'citizenship.pdf',
  'transcription': 'umiejscowienie.pdf',
  'registration': 'uzupelnienie.pdf'
};

// Simple field mappings (expand as needed)
const FIELD_MAPS: Record<string, Record<string, string>> = {
  'poa-adult': {
    'applicant_first_name': 'applicant_given_names',
    'applicant_last_name': 'applicant_last_name',
    'applicant_birth_date': 'applicant_dob',
    // Add more as needed
  },
  'citizenship': {
    'imie': 'applicant_given_names',
    'nazwisko': 'applicant_last_name',
    // Add more as needed
  }
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const { caseId, templateType } = await req.json();
    console.log(`[pdf-simple] START: ${templateType} for case ${caseId}`);

    // Validate inputs
    if (!caseId || !templateType) {
      throw new Error('Missing caseId or templateType');
    }

    const templatePath = TEMPLATE_PATHS[templateType];
    if (!templatePath) {
      throw new Error(`Unknown template type: ${templateType}`);
    }

    // Initialize Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Step 1: Get master data
    console.log('[pdf-simple] Fetching master data...');
    const { data: masterData, error: dataError } = await supabase
      .from('master_table')
      .select('*')
      .eq('case_id', caseId)
      .maybeSingle();

    if (dataError) throw dataError;
    if (!masterData) throw new Error('No data found for case');

    // Step 2: Download template
    console.log('[pdf-simple] Downloading template:', templatePath);
    const { data: templateBlob, error: downloadError } = await supabase.storage
      .from('pdf-templates')
      .download(templatePath);

    if (downloadError) throw downloadError;
    if (!templateBlob) throw new Error('Template not found');

    // Step 3: Load and fill PDF
    console.log('[pdf-simple] Loading PDF...');
    const templateBytes = new Uint8Array(await templateBlob.arrayBuffer());
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log(`[pdf-simple] Found ${fields.length} fields in template`);

    // Get field mapping for this template
    const fieldMap = FIELD_MAPS[templateType] || {};
    let filledCount = 0;

    // Fill fields
    for (const field of fields) {
      try {
        const fieldName = field.getName();
        
        // Try to get value from mapping or direct field name
        const mappingKey = fieldMap[fieldName] || fieldName;
        const value = masterData[mappingKey];

        if (value != null && value !== '') {
          const textField = form.getTextField(fieldName);
          textField.setText(String(value));
          filledCount++;
        }
      } catch (e) {
        // Skip fields we can't fill
        console.log(`[pdf-simple] Skipped field: ${field.getName()}`);
      }
    }

    console.log(`[pdf-simple] Filled ${filledCount}/${fields.length} fields`);

    // Step 4: Save PDF
    const pdfBytes = await pdfDoc.save();
    
    // Step 5: Upload to storage
    const filename = `${templateType}-${caseId}-${Date.now()}.pdf`;
    const uploadPath = `generated/${filename}`;
    
    console.log('[pdf-simple] Uploading PDF:', uploadPath);
    const { error: uploadError } = await supabase.storage
      .from('pdf-outputs')
      .upload(uploadPath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Step 6: Get signed URL (valid for 1 hour)
    const { data: signedData, error: signError } = await supabase.storage
      .from('pdf-outputs')
      .createSignedUrl(uploadPath, 3600);

    if (signError) throw signError;

    const duration = Date.now() - startTime;
    console.log(`[pdf-simple] SUCCESS in ${duration}ms: ${signedData.signedUrl}`);

    return new Response(
      JSON.stringify({
        success: true,
        url: signedData.signedUrl,
        fieldsFilledCount: filledCount,
        totalFields: fields.length,
        fillRate: Math.round((filledCount / fields.length) * 100),
        duration,
        filename
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error('[pdf-simple] ERROR after', duration, 'ms:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        duration
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
