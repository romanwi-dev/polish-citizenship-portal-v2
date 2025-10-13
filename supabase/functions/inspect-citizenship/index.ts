import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Loading citizenship.pdf template...');
    
    // Read PDF from public folder
    const pdfPath = './templates/citizenship.pdf';
    const pdfBytes = await Deno.readFile(pdfPath);
    
    // Dynamically import pdf-lib
    const { PDFDocument } = await import('npm:pdf-lib@^1.17.1');
    
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    // Extract field information
    const fieldInfo = fields.map(field => ({
      name: field.getName(),
      type: field.constructor.name,
    }));
    
    // Filter for biographical fields (zyciorys / pradziadkowie)
    const bioFields = fieldInfo.filter(f => 
      f.name.includes('zyciorys') || f.name.includes('pradziadkowie')
    );
    
    console.log(`Found ${bioFields.length} biographical fields in citizenship.pdf`);
    
    return new Response(
      JSON.stringify({
        success: true,
        totalFields: fieldInfo.length,
        bioFields: bioFields,
        allFields: fieldInfo,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error inspecting PDF:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
