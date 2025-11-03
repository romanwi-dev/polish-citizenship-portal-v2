import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { json, corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req.headers.get('Origin')) });
  try {
    const url = Deno.env.get('SUPABASE_URL')!;
    const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(url, key);

    const path = `selftest/${Date.now()}.txt`;
    const bytes = new TextEncoder().encode('ok');
    const up = await sb.storage.from('generated-pdfs').upload(path, bytes, { contentType: 'text/plain', upsert: true });
    if (up.error) return json(req, { ok: false, step: 'upload', error: up.error.message }, 500);

    const sign = await sb.storage.from('generated-pdfs').createSignedUrl(path, 300, { download: 'selftest.txt' });
    if (sign.error || !sign.data?.signedUrl) return json(req, { ok: false, step: 'sign', error: sign.error?.message }, 500);

    return json(req, { ok: true, url: sign.data.signedUrl }, 200);
  } catch (e: any) {
    return json(req, { ok: false, step: 'exception', error: String(e?.message ?? e) }, 500);
  }
});
