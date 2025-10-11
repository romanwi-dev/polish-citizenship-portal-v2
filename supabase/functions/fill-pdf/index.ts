import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";
import { fillPDFFields, calculateCoverage } from './lib/fieldFiller.ts';
import { POA_ADULT_PDF_MAP } from './mappings/poaAdult.ts';
import { POA_MINOR_PDF_MAP } from './mappings/poaMinor.ts';
import { POA_SPOUSES_PDF_MAP } from './mappings/poaSpouses.ts';
import { CITIZENSHIP_PDF_MAP } from './mappings/citizenship.ts';
import { FAMILY_TREE_PDF_MAP } from './mappings/familyTree.ts';
import { UMIEJSCOWIENIE_PDF_MAP } from './mappings/umiejscowienie.ts';
import { UZUPELNIENIE_PDF_MAP } from './mappings/uzupelnienie.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId, templateType, inspectOnly } = await req.json();
    
    if (!templateType) {
      throw new Error('templateType is required');
    }

    // Inspection mode - just return field names
    if (inspectOnly) {
      console.log(`🔍 Inspecting PDF fields: ${templateType}`);
      
      const templatePath = `./templates/${templateType}.pdf`;
      let pdfBytes: Uint8Array;
      
      try {
        pdfBytes = await Deno.readFile(templatePath);
        console.log(`✅ Loaded template: ${templatePath} (${pdfBytes.length} bytes)`);
      } catch (error) {
        console.error(`❌ Failed to load template: ${templatePath}`, error);
        throw new Error(`Template not found: ${templateType}`);
      }

      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();
      const fields = form.getFields();
      
      const fieldInfo = fields.map(field => ({
        name: field.getName(),
        type: field.constructor.name,
      }));

      console.log(`Found ${fieldInfo.length} fields in ${templateType}`);

      return new Response(
        JSON.stringify({
          templateType,
          templatePath,
          totalFields: fieldInfo.length,
          fields: fieldInfo,
        }, null, 2),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    if (!caseId) {
      throw new Error('caseId is required for PDF generation');
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

    // Get the appropriate field mapping for this template
    const fieldMappings: Record<string, Record<string, string>> = {
      'poa-adult': POA_ADULT_PDF_MAP,
      'poa-minor': POA_MINOR_PDF_MAP,
      'poa-spouses': POA_SPOUSES_PDF_MAP,
      'citizenship': CITIZENSHIP_PDF_MAP,
      'family-tree': FAMILY_TREE_PDF_MAP,
      'umiejscowienie': UMIEJSCOWIENIE_PDF_MAP,
      'uzupelnienie': UZUPELNIENIE_PDF_MAP,
    };
    
    const fieldMap = fieldMappings[templateType];
    
    if (!fieldMap || Object.keys(fieldMap).length === 0) {
      console.warn(`⚠️ No field mapping defined for template: ${templateType}`);
      console.warn('Falling back to legacy field filling (may not be complete)');
      
      // Legacy fallback for unmapped templates
      if (templateType === 'family-tree') {
        form.getTextField('applicantName')?.setText(`${masterData.applicant_first_name || ''} ${masterData.applicant_last_name || ''}`.trim());
        form.getTextField('fatherName')?.setText(`${masterData.father_first_name || ''} ${masterData.father_last_name || ''}`.trim());
        form.getTextField('motherName')?.setText(`${masterData.mother_first_name || ''} ${masterData.mother_last_name || ''}`.trim());
      }
    } else {
      // Use the universal field filler with mapping
      const fillResult = fillPDFFields(form, masterData, fieldMap);
      const coverage = calculateCoverage(fillResult);
      
      console.log(`✅ PDF Generation Complete for ${templateType}`);
      console.log(`   Total fields: ${fillResult.totalFields}`);
      console.log(`   Filled fields: ${fillResult.filledFields}`);
      console.log(`   Coverage: ${coverage}%`);
      
      if (fillResult.emptyFields.length > 0 && fillResult.emptyFields.length <= 10) {
        console.log(`   Empty fields: ${fillResult.emptyFields.join(', ')}`);
      } else if (fillResult.emptyFields.length > 10) {
        console.log(`   Empty fields (${fillResult.emptyFields.length}): ${fillResult.emptyFields.slice(0, 5).join(', ')}...`);
      }
      
      if (fillResult.errors.length > 0) {
        console.warn(`   ⚠️ Errors (${fillResult.errors.length})`);
        fillResult.errors.slice(0, 3).forEach(err => {
          console.warn(`     - ${err.field}: ${err.error}`);
        });
      }
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
