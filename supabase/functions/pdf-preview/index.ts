import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getFieldMapping } from '../_shared/pdf-field-maps.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function resolveValue(mappingValue: string, masterData: any): string | null {
  if (!mappingValue || !masterData) return null;

  if (mappingValue.includes('|')) {
    const parts = mappingValue.split('|')
      .map(key => masterData[key.trim()])
      .filter(val => val != null && val !== '');
    return parts.length > 0 ? parts.join(' ') : null;
  }

  if (mappingValue.includes('.')) {
    const [field, subfield] = mappingValue.split('.');
    const dateValue = masterData[field];
    
    if (!dateValue) return null;
    
    if (typeof dateValue === 'string' && dateValue.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
      const [day, month, year] = dateValue.split('.');
      if (subfield === 'day') return day;
      if (subfield === 'month') return month;
      if (subfield === 'year') return year;
    }
    
    if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}/)) {
      const [year, month, day] = dateValue.split('T')[0].split('-');
      if (subfield === 'day') return day;
      if (subfield === 'month') return month;
      if (subfield === 'year') return year;
    }
    
    return null;
  }

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
        JSON.stringify({ error: 'Invalid template type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get master data
    const { data: masterData } = await admin
      .from('master_table')
      .select('*')
      .eq('case_id', caseId)
      .single();

    // Download template
    const { data: templateData, error: downloadError } = await admin.storage
      .from('pdf-templates')
      .download(templatePath);

    if (downloadError || !templateData) {
      return new Response(
        JSON.stringify({ error: 'Template download failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const templateBytes = new Uint8Array(await templateData.arrayBuffer());
    const { PDFDocument } = await import('https://esm.sh/pdf-lib@1.17.1');
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    
    const fieldMapping = getFieldMapping(templateType);
    const fields = form.getFields();
    
    const fieldPreview: Array<{
      name: string;
      value: string | null;
      isFilled: boolean;
      mappingSource?: string;
    }> = [];
    
    for (const field of fields) {
      try {
        const fieldName = field.getName();
        let value: string | null = null;
        let mappingSource: string | undefined;
        
        if (fieldMapping && fieldMapping[fieldName]) {
          mappingSource = fieldMapping[fieldName];
          value = resolveValue(mappingSource, masterData);
        } else if (masterData && masterData[fieldName]) {
          value = String(masterData[fieldName]);
          mappingSource = fieldName;
        }
        
        fieldPreview.push({
          name: fieldName,
          value,
          isFilled: value !== null && value !== '',
          mappingSource
        });
      } catch (e) {
        // Skip non-text fields
      }
    }

    const filledFields = fieldPreview.filter(f => f.isFilled);
    const unfilledFields = fieldPreview.filter(f => !f.isFilled);
    
    return new Response(
      JSON.stringify({
        success: true,
        templateType,
        stats: {
          total: fieldPreview.length,
          filled: filledFields.length,
          unfilled: unfilledFields.length,
          fillRate: Math.round((filledFields.length / fieldPreview.length) * 100)
        },
        fields: {
          filled: filledFields,
          unfilled: unfilledFields
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Preview] Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
