import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async () => {
  try {
    const url = Deno.env.get('SUPABASE_URL')!, key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(url, key);
    const bucket = 'generated-pdfs';
    const cutoff = Date.now() - 7*24*60*60*1000;

    const { data: cases } = await sb.storage.from(bucket).list('', { limit: 1000 });
    for (const dir of cases ?? []) {
      if (!dir?.name) continue;
      let offset = 0, page = 1000;
      while (true) {
        const { data: files } = await sb.storage.from(bucket).list(dir.name, { limit: page, offset });
        if (!files?.length) break;
        const toDelete = files
          .filter(f => f?.updated_at && new Date(f.updated_at).getTime() < cutoff)
          .map(f => `${dir.name}/${f.name}`);
        if (toDelete.length) await sb.storage.from(bucket).remove(toDelete);
        offset += files.length;
        if (files.length < page) break;
      }
    }
    return new Response('ok');
  } catch {
    return new Response('error', { status: 500 });
  }
});
