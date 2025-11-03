export function allowedOrigins() {
  const raw = Deno.env.get('ALLOWED_ORIGINS') ?? '';
  return new Set(raw.split(',').map(s => s.trim()).filter(Boolean));
}

export function corsHeaders(origin: string | null) {
  const allowed = allowedOrigins();
  const allow = origin && allowed.has(origin) ? origin : (allowed.size > 0 ? 'null' : '*');
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, content-type',
    'Vary': 'Origin',
  };
}

export function json(req: Request, body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req.headers.get('Origin')), 'Content-Type': 'application/json' }
  });
}
