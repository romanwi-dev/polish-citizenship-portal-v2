import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PDFDocument } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { templateType } = await req.json();
    
    if (!templateType) {
      return new Response(
        JSON.stringify({ error: 'templateType is required (citizenship, transcription, registration)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔍 Inspecting template: ${templateType}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Download template from storage
    const { data: templateBlob, error: downloadError } = await supabase.storage
      .from('pdf-templates')
      .download(`${templateType}.pdf`);

    if (downloadError) {
      console.error('Download error:', downloadError);
      return new Response(
        JSON.stringify({ error: `Failed to download template: ${downloadError.message}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Load PDF and inspect fields
    const templateBytes = new Uint8Array(await templateBlob.arrayBuffer());
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    const fieldInfo = fields.map(field => ({
      name: field.getName(),
      type: field.constructor.name,
    }));

    console.log(`✅ Found ${fieldInfo.length} fields in ${templateType}`);

    return new Response(
      JSON.stringify({
        success: true,
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
    console.error('❌ Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: (error as Error).message,
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});