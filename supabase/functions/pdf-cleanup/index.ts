import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async () => {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  if (!url || !key) {
    console.error('[PDF-CLEANUP] Missing env vars');
    return new Response('config-error', { status: 500 });
  }

  const sb = createClient(url, key);
  const bucket = 'generated-pdfs';
  const cutoff = Date.now() - 3 * 24 * 60 * 60 * 1000; // 3 days

  console.log('[PDF-CLEANUP] Starting cleanup of artifacts older than 3 days');

  try {
    // Get all artifacts older than cutoff
    const { data: artifacts, error: fetchError } = await sb
      .from('pdf_artifacts')
      .select('id, path, created_at');

    if (fetchError) {
      console.error('[PDF-CLEANUP] Error fetching artifacts:', fetchError);
      return new Response('fetch-error', { status: 500 });
    }

    const toDelete = (artifacts ?? []).filter(a => 
      new Date(a.created_at).getTime() < cutoff
    );

    console.log(`[PDF-CLEANUP] Found ${toDelete.length} artifacts to delete`);

    for (const artifact of toDelete) {
      // Delete from storage
      const { error: storageError } = await sb.storage
        .from(bucket)
        .remove([artifact.path]);

      if (storageError) {
        console.error(`[PDF-CLEANUP] Failed to delete ${artifact.path}:`, storageError);
        continue;
      }

      // Delete artifact record
      const { error: dbError } = await sb
        .from('pdf_artifacts')
        .delete()
        .eq('id', artifact.id);

      if (dbError) {
        console.error(`[PDF-CLEANUP] Failed to delete artifact ${artifact.id}:`, dbError);
        continue;
      }

      console.log(`[PDF-CLEANUP] ✓ Deleted ${artifact.path}`);
    }

    console.log(`[PDF-CLEANUP] Cleanup complete: ${toDelete.length} artifacts removed`);
    return new Response(JSON.stringify({ deleted: toDelete.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[PDF-CLEANUP] Error:', e);
    return new Response('error', { status: 500 });
  }
});
