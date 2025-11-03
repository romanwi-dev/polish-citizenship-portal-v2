import { json, corsHeaders } from '../_shared/cors.ts';

Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req.headers.get('Origin')) });
  return json(req, { ok: true, ts: new Date().toISOString(), runtime: 'deno-edge' }, 200);
});
