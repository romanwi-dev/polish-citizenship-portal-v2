import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { PDFDocument } from 'https://esm.sh/pdf-lib@1.17.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LockPDFRequest {
  documentId: string;
  caseId: string;
  pdfUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create authenticated client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { documentId, caseId, pdfUrl }: LockPDFRequest = await req.json();

    console.log(`[lock-pdf] Locking PDF for document ${documentId}`);

    // Fetch the PDF from storage
    const pdfResponse = await fetch(pdfUrl);
    if (!pdfResponse.ok) {
      throw new Error(`Failed to fetch PDF: ${pdfResponse.statusText}`);
    }

    const pdfBytes = await pdfResponse.arrayBuffer();
    
    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    // Get the form
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    
    console.log(`[lock-pdf] Found ${fields.length} fields to flatten`);

    // Flatten all fields (makes them non-editable)
    form.flatten();
    
    console.log(`[lock-pdf] All fields flattened successfully`);

    // Save the locked PDF
    const lockedPdfBytes = await pdfDoc.save();
    
    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${caseId}/${documentId}_locked_${timestamp}.pdf`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('generated-pdfs')
      .upload(filename, lockedPdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('[lock-pdf] Upload error:', uploadError);
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get signed URL (valid for 1 year)
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from('generated-pdfs')
      .createSignedUrl(filename, 31536000); // 1 year

    if (signedUrlError) {
      throw new Error(`Failed to create signed URL: ${signedUrlError.message}`);
    }

    // Update document record
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        pdf_locked_url: signedUrlData.signedUrl,
        locked_at: new Date().toISOString(),
        pdf_status: 'printed',
        status_updated_at: new Date().toISOString()
      })
      .eq('id', documentId);

    if (updateError) {
      console.error('[lock-pdf] Database update error:', updateError);
      throw new Error(`Database update failed: ${updateError.message}`);
    }

    // Log to pdf_history
    await supabase
      .from('pdf_history')
      .insert({
        document_id: documentId,
        action: 'locked_for_print',
        old_status: 'generated',
        new_status: 'printed',
        changed_by: user.id,
        metadata: {
          locked_url: signedUrlData.signedUrl,
          field_count: fields.length
        }
      });

    console.log(`[lock-pdf] Successfully locked PDF: ${filename}`);

    return new Response(
      JSON.stringify({
        success: true,
        lockedUrl: signedUrlData.signedUrl,
        filename,
        fieldsFlattened: fields.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[lock-pdf] Error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
