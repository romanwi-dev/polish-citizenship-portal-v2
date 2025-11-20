import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PDFResult {
  templateType: string;
  success: boolean;
  url?: string;
  error?: string;
  fieldsFilledCount?: number;
  totalFields?: number;
  fillRate?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { caseId } = await req.json();

    if (!caseId) {
      return new Response(
        JSON.stringify({ error: 'caseId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[bulk-generate-pdfs] Starting bulk generation for case: ${caseId}`);

    const URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(URL, SERVICE_KEY);

    // Get case data and POA data to determine which PDFs to generate
    const { data: caseData } = await admin
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (!caseData) {
      return new Response(
        JSON.stringify({ error: 'Case not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get POA data to check for minor children and marriage status
    const { data: poaData } = await admin
      .from('poa')
      .select('minor_children_count, is_married')
      .eq('case_id', caseId)
      .maybeSingle();

    const minorChildrenCount = poaData?.minor_children_count || 0;
    const isMarried = poaData?.is_married || false;

    console.log(`[bulk-generate-pdfs] POA config: minors=${minorChildrenCount}, married=${isMarried}`);

    // Define PDF templates to generate based on case data
    const templates = [
      { type: 'poa-adult', name: 'POA Adult' }, // Always generate
    ];

    // Add POA Minor for each minor child (all use same template, child index is handled by pdf-simple)
    for (let i = 1; i <= minorChildrenCount; i++) {
      templates.push({ type: 'poa-minor', name: `POA Minor ${i}` });
    }

    // Add POA Spouses only if married
    if (isMarried) {
      templates.push({ type: 'poa-spouses', name: 'POA Spouses' });
    }

    // Always add these forms
    templates.push(
      { type: 'family-tree', name: 'Family Tree' },
      { type: 'citizenship', name: 'Citizenship Application' },
      { type: 'transcription', name: 'Civil Registry' },
    );

    const results: PDFResult[] = [];

    // Generate each PDF sequentially to avoid overload
    for (const template of templates) {
      console.log(`[bulk-generate-pdfs] Generating ${template.name}...`);
      
      try {
        const { data: pdfData, error: pdfError } = await admin.functions.invoke('pdf-simple', {
          body: {
            caseId,
            templateType: template.type
          }
        });

        if (pdfError) {
          console.error(`[bulk-generate-pdfs] Error generating ${template.name}:`, pdfError);
          results.push({
            templateType: template.type,
            success: false,
            error: pdfError.message || 'Generation failed'
          });
          continue;
        }

        if (!pdfData?.success) {
          console.error(`[bulk-generate-pdfs] ${template.name} generation failed:`, pdfData);
          results.push({
            templateType: template.type,
            success: false,
            error: pdfData?.error || 'Unknown error'
          });
          continue;
        }

        console.log(`[bulk-generate-pdfs] ${template.name} generated successfully`);
        results.push({
          templateType: template.type,
          success: true,
          url: pdfData.url,
          fieldsFilledCount: pdfData.fieldsFilledCount,
          totalFields: pdfData.totalFields,
          fillRate: pdfData.fillRate
        });

      } catch (error: any) {
        console.error(`[bulk-generate-pdfs] Exception generating ${template.name}:`, error);
        results.push({
          templateType: template.type,
          success: false,
          error: error.message || 'Exception occurred'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    console.log(`[bulk-generate-pdfs] Completed: ${successCount}/${totalCount} PDFs generated`);

    return new Response(
      JSON.stringify({
        success: true,
        summary: {
          total: totalCount,
          successful: successCount,
          failed: totalCount - successCount
        },
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('[bulk-generate-pdfs] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
