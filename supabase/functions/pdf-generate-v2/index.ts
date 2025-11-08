import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getFieldMapping } from '../_shared/pdf-field-maps.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Resolves a value from masterData using mapping rules
 * Handles: concatenation (|), date splitting (.day/.month/.year), nested objects
 */
function resolveValue(mappingValue: string, masterData: any): string | null {
  if (!mappingValue || !masterData) return null;

  // Handle concatenation (e.g., "first_name|last_name")
  if (mappingValue.includes('|')) {
    const parts = mappingValue.split('|')
      .map(key => masterData[key.trim()])
      .filter(val => val != null && val !== '');
    return parts.length > 0 ? parts.join(' ') : null;
  }

  // Handle date splitting (e.g., "applicant_dob.day")
  if (mappingValue.includes('.')) {
    const [field, subfield] = mappingValue.split('.');
    const dateValue = masterData[field];
    
    if (!dateValue) return null;
    
    // Handle DD.MM.YYYY format
    if (typeof dateValue === 'string' && dateValue.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
      const [day, month, year] = dateValue.split('.');
      if (subfield === 'day') return day;
      if (subfield === 'month') return month;
      if (subfield === 'year') return year;
    }
    
    // Handle YYYY-MM-DD format (ISO dates)
    if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}/)) {
      const [year, month, day] = dateValue.split('T')[0].split('-');
      if (subfield === 'day') return day;
      if (subfield === 'month') return month;
      if (subfield === 'year') return year;
    }
    
    return null;
  }

  // Direct field access
  const value = masterData[mappingValue];
  return value != null ? String(value) : null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId, templateType } = await req.json();
    
    if (!caseId || !templateType) {
      return new Response(
        JSON.stringify({ error: 'caseId and templateType required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const URL = Deno.env.get('SUPABASE_URL')!;
    const SRK = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(URL, SRK);

    // CORRECT template paths - lowercase with hyphens
    const templatePaths: Record<string, string> = {
      'poa-adult': 'poa-adult.pdf',
      'poa-minor': 'poa-minor.pdf',
      'poa-spouses': 'poa-spouses.pdf',
      'family-tree': 'family-tree.pdf',
      'citizenship': 'citizenship.pdf',
      'transcription': 'umiejscowienie.pdf',
      'registration': 'uzupelnienie.pdf'
    };

    const templatePath = templatePaths[templateType];
    if (!templatePath) {
      return new Response(
        JSON.stringify({ error: 'Invalid template type', validTypes: Object.keys(templatePaths) }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify case exists
    const { data: caseData, error: caseError } = await admin
      .from('cases')
      .select('id')
      .eq('id', caseId)
      .single();

    if (caseError || !caseData) {
      return new Response(
        JSON.stringify({ error: 'Case not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Download template with EXACT path
    console.log(`[V2] Downloading template: ${templatePath}`);
    const { data: templateData, error: downloadError } = await admin.storage
      .from('pdf-templates')
      .download(templatePath);

    if (downloadError || !templateData) {
      console.error(`[V2] Download failed:`, downloadError);
      return new Response(
        JSON.stringify({ 
          error: 'Template download failed',
          templatePath,
          details: downloadError?.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const templateBytes = new Uint8Array(await templateData.arrayBuffer());
    console.log(`[V2] Template downloaded: ${templateBytes.length} bytes`);

    // Load and fill PDF
    const { PDFDocument } = await import('https://esm.sh/pdf-lib@1.17.1');
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    
    // Get master data
    const { data: masterData } = await admin
      .from('master_table')
      .select('*')
      .eq('case_id', caseId)
      .single();

    // Get mapping for this template type
    const fieldMapping = getFieldMapping(templateType);
    
    if (!fieldMapping) {
      console.warn(`[V2] No mapping found for template type: ${templateType}`);
    }

    // Fill PDF fields using mapping
    const fields = form.getFields();
    let filledCount = 0;
    let mappedCount = 0;
    const unmappedFields: string[] = [];
    
    for (const field of fields) {
      try {
        const fieldName = field.getName();
        
        if (fieldMapping && fieldMapping[fieldName]) {
          // Use mapping to resolve value
          const mappingValue = fieldMapping[fieldName];
          const resolvedValue = resolveValue(mappingValue, masterData);
          
          if (resolvedValue) {
            const textField = form.getTextField(fieldName);
            textField.setText(resolvedValue);
            filledCount++;
          }
          mappedCount++;
        } else {
          // Fallback: try direct field name match
          if (masterData && masterData[fieldName]) {
            const textField = form.getTextField(fieldName);
            textField.setText(String(masterData[fieldName]));
            filledCount++;
          } else {
            unmappedFields.push(fieldName);
          }
        }
      } catch (e) {
        // Skip fields that can't be filled (checkboxes, etc.)
      }
    }

    console.log(`[V2] Filled ${filledCount}/${fields.length} fields (${mappedCount} via mapping)`);
    if (unmappedFields.length > 0) {
      console.log(`[V2] Unmapped fields:`, unmappedFields.slice(0, 10));
    }

    // Save PDF
    const filledPdfBytes = await pdfDoc.save();

    // Upload to storage
    const filename = `${caseId}/${templateType}-${Date.now()}.pdf`;
    const { error: uploadError } = await admin.storage
      .from('generated-pdfs')
      .upload(filename, filledPdfBytes, { contentType: 'application/pdf', upsert: true });

    if (uploadError) {
      return new Response(
        JSON.stringify({ error: 'Upload failed', details: uploadError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create signed URL
    const { data: signedUrl, error: signError } = await admin.storage
      .from('generated-pdfs')
      .createSignedUrl(filename, 600);

    if (signError || !signedUrl) {
      return new Response(
        JSON.stringify({ error: 'Failed to create signed URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        url: signedUrl.signedUrl,
        filename: filename.split('/').pop(),
        stats: { 
          filled: filledCount, 
          total: fields.length,
          mapped: mappedCount,
          fillRate: fields.length > 0 ? Math.round((filledCount / fields.length) * 100) : 0
        },
        version: 'v2-universal-mapping'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[V2] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        version: 'v2-fresh-deployment'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
