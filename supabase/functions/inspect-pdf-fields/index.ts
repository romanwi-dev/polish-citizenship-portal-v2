import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { templateType } = await req.json();
    
    if (!templateType) {
      throw new Error('templateType is required');
    }

    const templateFileMap: Record<string, string> = {
      'poa-adult': 'poa-adult.pdf',
      'poa-minor': 'poa-minor.pdf',
      'poa-spouses': 'poa-spouses.pdf',
      'family-tree': 'family-tree.pdf',
      'registration': 'registration.pdf',
      'uzupelnienie': 'uzupelnienie.pdf',
      'citizenship': 'citizenship.pdf',
    };

    const templateFileName = templateFileMap[templateType];
    if (!templateFileName) {
      throw new Error(`Unknown template type: ${templateType}`);
    }

    const templatePath = `./templates/${templateFileName}`;
    console.log(`Inspecting template from: ${templatePath}`);
    
    let templateBytes: Uint8Array;
    try {
      templateBytes = await Deno.readFile(templatePath);
      console.log(`✅ Loaded template: ${templatePath} (${templateBytes.length} bytes)`);
      
      // Verify it's a valid PDF
      const pdfHeader = new TextDecoder().decode(templateBytes.slice(0, 8));
      console.log(`PDF Header: ${pdfHeader}`);
      
      if (!pdfHeader.startsWith('%PDF-')) {
        throw new Error(`Invalid PDF file: header is "${pdfHeader}" instead of "%PDF-"`);
      }
    } catch (error) {
      console.error(`❌ Failed to load template: ${templatePath}`, error);
      throw new Error(`Template not found or invalid: ${templateType} - ${(error as Error).message}`);
    }
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    
    // Get all fields
    const fields = form.getFields();
    
    const fieldInfo = fields.map(field => ({
      name: field.getName(),
      type: field.constructor.name,
    }));

    console.log(`Found ${fieldInfo.length} fields in ${templateType}`);
    console.log('Fields:', JSON.stringify(fieldInfo, null, 2));

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

  } catch (error) {
    console.error('Error inspecting PDF:', error);
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message,
        stack: (error as Error).stack,
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
