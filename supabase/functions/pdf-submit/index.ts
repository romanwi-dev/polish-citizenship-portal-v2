import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = new Set([
  'https://your-production-domain.com',
  'https://app.your-production-domain.com',
  'http://localhost:5173',
]);

const TEMPLATE_VERSION = Deno.env.get('TEMPLATE_VERSION') ?? '2025.11.03';

function cors(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'null';
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Vary': 'Origin',
  };
}

function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(req.headers.get('Origin')), 'Content-Type': 'application/json' },
  });
}

function sanitizeCaseId(raw: unknown): string | null {
  const s = String(raw ?? '');
  // Allow letters, numbers, _ and -, 1..64 chars
  if (/^[A-Za-z0-9_-]{1,64}$/.test(s)) return s;
  return null;
}

async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

const VALID_TEMPLATES = new Set([
  'citizenship',
  'family-tree',
  'transcription',
  'registration',
  'poa-adult',
  'poa-minor',
  'poa-spouses',
]);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors(req.headers.get('Origin')) });
  }

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SERVICE_KEY) {
      return json(req, { error: 'Server not configured' }, 500);
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY);

    const body = await req.json().catch(() => ({}));
    const { caseId: raw, templateType, dataHash } = body;

    // Validate inputs
    const caseId = sanitizeCaseId(raw);
    if (!caseId) {
      return json(req, { error: 'Invalid caseId' }, 400);
    }
    
    if (!VALID_TEMPLATES.has(String(templateType))) {
      return json(req, { error: `Invalid templateType: ${templateType}` }, 400);
    }

    // Authorization
    const authHeader = req.headers.get('Authorization') || '';
    const jwt = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!jwt) {
      return json(req, { error: 'Unauthorized' }, 401);
    }

    const { data: userData, error: userErr } = await admin.auth.getUser(jwt);
    if (userErr || !userData?.user) {
      return json(req, { error: 'Unauthorized' }, 401);
    }
    const userId = userData.user.id;

    // Check case ownership
    const { data: caseRow } = await admin
      .from('cases')
      .select('id, user_id')
      .eq('id', caseId)
      .maybeSingle();

    const isAdmin = userData.user.app_metadata?.role === 'admin';
    if (!caseRow || (!isAdmin && caseRow.user_id !== userId)) {
      return json(req, { error: 'Forbidden' }, 403);
    }

    // Create idempotency key
    const artifactKey = await sha256Hex(
      `${caseId}|${templateType}|${TEMPLATE_VERSION}|${dataHash ?? ''}`
    );

    console.log(`[PDF-SUBMIT] Artifact key: ${artifactKey}`);

    // Check artifact cache
    const { data: artifact } = await admin
      .from('pdf_artifacts')
      .select('path, size_bytes')
      .eq('artifact_key', artifactKey)
      .maybeSingle();

    if (artifact?.path) {
      console.log(`[PDF-SUBMIT] Cache hit for ${artifactKey}`);
      
      const { data: signData, error: signError } = await admin.storage
        .from('generated-pdfs')
        .createSignedUrl(artifact.path, 600, {
          download: artifact.path.split('/').pop() ?? 'document.pdf',
        });

      if (signError || !signData?.signedUrl) {
        return json(req, { error: 'Signing failed' }, 500);
      }

      // Record access
      await admin.from('generated_documents').insert({
        case_id: caseId,
        template_type: templateType,
        path: artifact.path,
        user_id: userId,
        size_bytes: artifact.size_bytes,
        artifact_key: artifactKey,
      });

      return json(req, {
        status: 'cached',
        url: signData.signedUrl,
        filename: artifact.path.split('/').pop(),
        artifactKey,
      });
    }

    // Enqueue job
    console.log(`[PDF-SUBMIT] Cache miss, enqueueing job for ${artifactKey}`);
    
    const { error: jobError } = await admin.from('pdf_jobs').insert({
      artifact_key: artifactKey,
      case_id: caseId,
      template_type: templateType,
      user_id: userId,
    });

    if (jobError) {
      console.error('[PDF-SUBMIT] Queue failed:', jobError);
      return json(req, { error: 'Queue failed' }, 500);
    }

    return json(req, { status: 'queued', artifactKey });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('[PDF-SUBMIT] Error:', error);
    return json(req, { error: String(error?.message ?? error) }, 500);
  }
});
