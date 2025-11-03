import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    // Simple field filling (add more mappings as needed)
    const fields = form.getFields();
    let filledCount = 0;
    
    for (const field of fields) {
      try {
        const fieldName = field.getName();
        // Try to find matching data
        if (masterData && masterData[fieldName]) {
          const textField = form.getTextField(fieldName);
          textField.setText(String(masterData[fieldName]));
          filledCount++;
        }
      } catch (e) {
        // Skip fields that can't be filled
      }
    }

    console.log(`[V2] Filled ${filledCount}/${fields.length} fields`);

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
        stats: { filled: filledCount, total: fields.length },
        version: 'v2-fresh-deployment'
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
