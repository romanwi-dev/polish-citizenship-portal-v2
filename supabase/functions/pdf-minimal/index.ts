import { json, corsHeaders } from '../_shared/cors.ts';

/** Valid 1-page PDF saying "Hello, PDF!" (base64) */
const HELLO_PDF_BASE64 =
  "JVBERi0xLjQKJcTl8uXrp/Og0MTGCjEgMCBvYmoKPDwvVHlwZS9DYXRhbG9nL1BhZ2VzIDIgMCBSCj4+CmVuZG9iagoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHMgWzMgMCBSXS9Db3VudCAxCj4+CmVuZG9iagoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94IFswIDAgNTk1LjI4IDg0MS44OV0vQ29udGVudHMgNCAwIFIKPj4KZW5kb2JqCgo0IDAgb2JqCjw8L0xlbmd0aCA2Njo+PgpzdHJlYW0KQlQKL0YxIDI0IFRmCjEwMCA3NTAgVGQKKChIZWxsbywgUERGISkpIFQKRVQKZW5kc3RyZWFtCmVuZG9iagoKNiAwIG9iago8PC9UeXBlL0ZvbnQvU3VidHlwZS9UeXBlMS9CYXNlRm9udC9IZWx2ZXRpY2E+PgplbmRvYmoKCjcgMCBvYmoKPDwvVHlwZS9Gb250RGVzY3JpcHRvci9Gb250TmFtZS9IZWx2ZXRpY2EvQXNjZW50IDkwMC9DYXBIZWlnaHQgOTA5L0Rlc2NlbnQgLTIxMi9GbGFncyAzMgovaXRhbGljQW5nbGUgMD4+CmVuZG9iagoKeHJlZgowIDgKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDczIDAwMDAwIG4gCjAwMDAwMDAxMzUgMDAwMDAgbiAKMDAwMDAwMDE5NyAwMDAwMCBuIAowMDAwMDAwMzI1IDAwMDAwIG4gCjAwMDAwMDA0MjggMDAwMDAgbiAKMDAwMDAwMDUyNyAwMDAwMCBuIAp0cmFpbGVyCjw8L1NpemUgOC9Sb290IDEgMCBSL0luZm8gNiAwIFIvSUQgWzxkNWU3ZjkxMmY5YjY1ZWQ3N2Y0YjE1ZTkwN2Q2ZWY0ZD4+XQo+PgpzdGFydHhyZWYKMzk1CiUlRU9G";

function b64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

Deno.serve((req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(req.headers.get('Origin')) });

  const mode = new URL(req.url).searchParams.get('mode'); // 'json' or 'binary'
  if (mode === 'binary') {
    const bytes = b64ToBytes(HELLO_PDF_BASE64);
    return new Response(bytes, {
      status: 200,
      headers: {
        ...corsHeaders(req.headers.get('Origin')),
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="hello.pdf"',
        'Cache-Control': 'no-store',
      }
    });
  }
  return json(req, { ok: true, pdf: HELLO_PDF_BASE64, note: "Use ?mode=binary to stream bytes." }, 200);
});
