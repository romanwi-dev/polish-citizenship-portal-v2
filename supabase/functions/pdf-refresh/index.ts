import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function parseOrigins() {
  const raw = Deno.env.get('ALLOWED_ORIGINS') ?? '';
  return new Set(raw.split(',').map(s => s.trim()).filter(Boolean));
}

const ORIGINS = parseOrigins();

function cors(origin: string | null) {
  const allow = origin && ORIGINS.has(origin) ? origin : 'null';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Vary': 'Origin'
  };
}

function j(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req.headers.get('Origin')), 'Content-Type': 'application/json' }
  });
}

function sanitizeCaseId(s: unknown) {
  const v = String(s ?? '');
  return /^[A-Za-z0-9_-]{1,64}$/.test(v) ? v : null;
}

const TTL = Number(Deno.env.get('SIGNED_URL_TTL_SECONDS') ?? '2700');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors(req.headers.get('Origin')) });
  }

  try {
    const { caseId: raw, templateType } = await req.json();
    const caseId = sanitizeCaseId(raw);
    if (!caseId) {
      return j(req, { code: 'INVALID_CASE_ID', message: 'Invalid caseId' }, 400);
    }

    const URL = Deno.env.get('SUPABASE_URL')!;
    const SRK = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;
    const admin = createClient(URL, SRK);

    const auth = req.headers.get('Authorization') || '';
    const jwt = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!jwt) {
      return j(req, { code: 'UNAUTHORIZED', message: 'Unauthorized' }, 401);
    }

    // RLS client for case ownership check
    const rls = createClient(URL, ANON, { global: { headers: { Authorization: `Bearer ${jwt}` } } });

    const { data: c } = await rls.from('cases').select('owner_user_id').eq('id', caseId).maybeSingle();
    if (!c) {
      return j(req, { code: 'CASE_NOT_FOUND', message: 'Case not found' }, 404);
    }

    const { data: recent } = await admin.from('generated_documents')
      .select('path')
      .eq('case_id', caseId)
      .eq('template_type', templateType)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!recent?.path) {
      return j(req, { code: 'NO_ARTIFACT', message: 'No artifact' }, 404);
    }

    const sign = await admin.storage.from('generated-pdfs')
      .createSignedUrl(recent.path, TTL, { download: recent.path.split('/').pop() ?? 'document.pdf' });

    if (sign.error || !sign.data?.signedUrl) {
      return j(req, { code: 'SIGN_FAIL', message: 'Signing failed' }, 500);
    }

    return j(req, { url: sign.data.signedUrl, filename: recent.path.split('/').pop() }, 200);
  } catch (e) {
    return j(req, { code: 'INTERNAL', message: 'Internal error' }, 500);
  }
});
