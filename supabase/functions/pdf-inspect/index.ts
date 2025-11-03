import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
      'registration': 'uzupelnienie.pdf',
      'transcription': 'umiejscowienie.pdf',
      'citizenship': 'citizenship.pdf',
    };

    const templateFileName = templateFileMap[templateType];
    if (!templateFileName) {
      throw new Error(`Unknown template type: ${templateType}`);
    }

    console.log(`Inspecting template: ${templateFileName}`);
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Download template from storage
    const { data: templateData, error: downloadError } = await supabase.storage
      .from('pdf-templates')
      .download(templateFileName);
      
    if (downloadError || !templateData) {
      throw new Error(`Failed to download template: ${downloadError?.message}`);
    }
    
    const arrayBuffer = await templateData.arrayBuffer();
    const templateBytes = new Uint8Array(arrayBuffer);
    console.log(`✅ Loaded template: ${templateFileName} (${templateBytes.length} bytes)`);
    
    // Check for XFA (appears in first 10KB typically)
    const headerChunk = new TextDecoder().decode(templateBytes.slice(0, Math.min(10000, templateBytes.length)));
    const hasXFA = headerChunk.includes('/XFA') || headerChunk.includes('<xfa:');
    
    if (hasXFA) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'XFA_NOT_SUPPORTED',
          message: 'This PDF contains XFA forms which are not supported by pdf-lib. Please use AcroForm-based PDFs.',
          templateType,
        }, null, 2),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Load PDF and inspect fields
    const { PDFDocument } = await import('https://esm.sh/pdf-lib@1.17.1');
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    
    const fields = form.getFields();
    const fieldInfo = fields.map(field => {
      const acroField = field.acroField;
      const ftRaw = acroField.dict.get(acroField.dict.context.obj('FT'));
      const ft = ftRaw ? String(ftRaw) : 'unknown';
      
      return {
        name: field.getName(),
        constructor: field.constructor.name,
        ft: ft,
      };
    });

    console.log(`Found ${fieldInfo.length} fields in ${templateType}`);
    console.log('Fields:', JSON.stringify(fieldInfo, null, 2));

    return new Response(
      JSON.stringify({
        ok: true,
        hasXFA: false,
        templateType,
        templateFileName,
        totalFields: fieldInfo.length,
        fields: fieldInfo,
      }, null, 2),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error inspecting PDF:', error);
    return new Response(
      JSON.stringify({ 
        ok: false,
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
