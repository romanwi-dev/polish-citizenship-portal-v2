import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { PDFDocument } from "https://esm.sh/pdf-lib@1.17.1";
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
    console.log('🔍 Starting Family Tree PDF inspection');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Download the PDF from storage
    const { data: pdfData, error: downloadError } = await supabase.storage
      .from('pdf-templates')
      .download('family-tree.pdf');

    if (downloadError || !pdfData) {
      console.error('Failed to download PDF:', downloadError);
      return new Response(
        JSON.stringify({ error: 'Failed to download PDF template' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Load PDF with pdf-lib
    const pdfBytes = await pdfData.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    const fieldInfo = fields.map(field => ({
      name: field.getName(),
      type: field.constructor.name,
    }));

    console.log(`✅ Found ${fieldInfo.length} fields in family-tree.pdf`);
    
    // Group fields by type for easier analysis
    const groupedFields = fieldInfo.reduce((acc, field) => {
      if (!acc[field.type]) acc[field.type] = [];
      acc[field.type].push(field.name);
      return acc;
    }, {} as Record<string, string[]>);

    return new Response(
      JSON.stringify({
        success: true,
        totalFields: fieldInfo.length,
        fields: fieldInfo,
        groupedByType: groupedFields,
        summary: {
          textFields: fieldInfo.filter(f => f.type === 'PDFTextField').length,
          checkBoxes: fieldInfo.filter(f => f.type === 'PDFCheckBox').length,
          dropdowns: fieldInfo.filter(f => f.type === 'PDFDropdown').length,
        }
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
