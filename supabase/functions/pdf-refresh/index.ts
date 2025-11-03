import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function parseOrigins() {
  const raw = Deno.env.get('ALLOWED_ORIGINS') ?? '';
  return new Set(raw.split(',').map(s => s.trim()).filter(Boolean));
}
const ORIGINS = parseOrigins();
function cors(origin: string | null) {
  const allow = origin && ORIGINS.has(origin) ? origin : 'null';
  return { 'Access-Control-Allow-Origin': allow, 'Access-Control-Allow-Methods':'POST, OPTIONS', 'Access-Control-Allow-Headers':'authorization, content-type', 'Vary':'Origin' };
}
function j(req: Request, body: unknown, status=200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors(req.headers.get('Origin')), 'Content-Type':'application/json' }});
}
function sanitizeCaseId(s: unknown){ const v=String(s??''); return /^[A-Za-z0-9_-]{1,64}$/.test(v)?v:null; }
const TTL = Number(Deno.env.get('SIGNED_URL_TTL_SECONDS') ?? '2700');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(req.headers.get('Origin')) });
  try {
    const { caseId: raw, templateType } = await req.json();
    const caseId = sanitizeCaseId(raw);
    if (!caseId) return j(req,{ error:'Invalid caseId' },400);

    const url = Deno.env.get('SUPABASE_URL')!, key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const admin = createClient(url, key);

    const auth = req.headers.get('Authorization')||'';
    const jwt = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!jwt) return j(req,{ error:'Unauthorized' },401);
    const { data: u } = await admin.auth.getUser(jwt);
    if (!u?.user) return j(req,{ error:'Unauthorized' },401);
    const userId = u.user.id;
    const isAdmin = u.user.app_metadata?.role === 'admin';

    const { data: c } = await admin.from('cases').select('owner_user_id').eq('id',caseId).maybeSingle();
    if (!c) return j(req,{ error:'Case not found' },404);
    if (!isAdmin && c.owner_user_id !== userId) return j(req,{ error:'Forbidden' },403);

    const { data: recent } = await admin.from('generated_documents')
      .select('path').eq('case_id',caseId).eq('template_type',templateType)
      .order('created_at', { ascending:false }).limit(1).maybeSingle();
    if (!recent?.path) return j(req,{ error:'No artifact' },404);

    const sign = await admin.storage.from('generated-pdfs')
      .createSignedUrl(recent.path, TTL, { download: recent.path.split('/').pop() ?? 'document.pdf' });
    if (sign.error || !sign.data?.signedUrl) return j(req,{ error:'Signing failed' },500);

    return j(req, { url: sign.data.signedUrl, filename: recent.path.split('/').pop() }, 200);
  } catch (e) {
    return j(req, { error:'Internal error' }, 500);
  }
});
