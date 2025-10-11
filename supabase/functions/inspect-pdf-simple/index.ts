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
      return new Response(
        JSON.stringify({ error: 'templateType is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔍 Inspecting PDF: ${templateType}`);
    
    const templatePath = `../fill-pdf/templates/${templateType}.pdf`;
    
    let pdfBytes: Uint8Array;
    try {
      pdfBytes = await Deno.readFile(templatePath);
      console.log(`✅ Loaded: ${templatePath} (${pdfBytes.length} bytes)`);
    } catch (error) {
      console.error(`❌ Load failed: ${templatePath}`, error);
      return new Response(
        JSON.stringify({ error: `Template not found: ${templateType}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    const fieldInfo = fields.map(field => ({
      name: field.getName(),
      type: field.constructor.name,
    }));

    console.log(`Found ${fieldInfo.length} fields`);

    return new Response(
      JSON.stringify({
        templateType,
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
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message,
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
