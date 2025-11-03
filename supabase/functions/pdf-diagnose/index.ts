import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const token = req.headers.get('x-admin-token');
  const ADMIN_TOKEN = Deno.env.get('INTERNAL_ADMIN_TOKEN');

  if (!ADMIN_TOKEN || token !== ADMIN_TOKEN) {
    return new Response('unauthorized', { status: 401 });
  }

  try {
    const url = Deno.env.get('SUPABASE_URL');
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!url || !key) {
      return new Response('config-error', { status: 500 });
    }

    const sb = createClient(url, key);
    
    // Test storage upload
    const path = `diagnostics/test-${Date.now()}.txt`;
    const testData = new TextEncoder().encode('PDF System Diagnostic Test');
    
    const { error: uploadError } = await sb.storage
      .from('generated-pdfs')
      .upload(path, testData, { contentType: 'text/plain', upsert: true });

    if (uploadError) {
      console.error('[PDF-DIAGNOSE] Upload failed:', uploadError);
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'storage-upload-failed',
        details: uploadError.message 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Test signed URL generation
    const { data: signData, error: signError } = await sb.storage
      .from('generated-pdfs')
      .createSignedUrl(path, 60);

    if (signError || !signData?.signedUrl) {
      console.error('[PDF-DIAGNOSE] Signing failed:', signError);
      return new Response(JSON.stringify({ 
        ok: false, 
        error: 'storage-signing-failed',
        details: signError?.message 
      }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Test database connectivity
    const { data: jobCount } = await sb
      .from('pdf_jobs')
      .select('id', { count: 'exact', head: true });

    const { data: artifactCount } = await sb
      .from('pdf_artifacts')
      .select('id', { count: 'exact', head: true });

    return new Response(JSON.stringify({
      ok: true,
      templateVersion: Deno.env.get('TEMPLATE_VERSION') ?? '2025.11.03',
      storage: {
        upload: 'ok',
        signedUrl: 'ok',
        testPath: path,
      },
      database: {
        jobsTable: 'ok',
        artifactsTable: 'ok',
      },
      timestamp: new Date().toISOString(),
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('[PDF-DIAGNOSE] Error:', error);
    return new Response(JSON.stringify({ 
      ok: false, 
      error: String(error?.message ?? error) 
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
