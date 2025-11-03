# Edge Self-Test (run in this order)

Replace `<EDGE_URL>` with your Supabase Edge Functions URL:
`https://oogmuakyqadpynnrasnd.supabase.co/functions/v1`

## 1) Health
```bash
curl -i "https://oogmuakyqadpynnrasnd.supabase.co/functions/v1/health"
```
**Expect:** 200 + `{"ok":true,...}`

## 2) CORS preflight
```bash
curl -i -X OPTIONS "https://oogmuakyqadpynnrasnd.supabase.co/functions/v1/health" -H "Origin: https://98b4e1c7-7682-4f23-9f68-2a61bbec99a9.lovableproject.com"
```
**Expect:** 200 + `Access-Control-Allow-Origin: https://98b4e1c7-7682-4f23-9f68-2a61bbec99a9.lovableproject.com`

## 3) Storage write + sign
```bash
curl -i -X POST "https://oogmuakyqadpynnrasnd.supabase.co/functions/v1/storage-test"
```
**Expect:** 200 + `{ ok:true, url:"https://...signed..." }`  
→ Open URL → download selftest.txt

## 4) Minimal PDF (JSON/base64)
```bash
curl -i -X POST "https://oogmuakyqadpynnrasnd.supabase.co/functions/v1/pdf-minimal"
```
**Expect:** 200 + `{ ok:true, pdf:"JVBERi0x..." }`

## 5) Minimal PDF (binary stream)
```bash
curl -i -X POST "https://oogmuakyqadpynnrasnd.supabase.co/functions/v1/pdf-minimal?mode=binary" -H "Accept: application/pdf"
```
**Expect:** 200 + `Content-Type: application/pdf`  
→ Opens 1-page "Hello, PDF!"

---

## Troubleshooting

**If any step fails:**

- **(1) fails** → deployment/env broken.
- **(2) fails** → ALLOWED_ORIGINS is wrong (CORS).
- **(3) fails** → Storage/bucket/Service Role key misconfig.
- **(4) works but your real PDF fails** → your generator is the culprit.
- **(5) works but app download fails** → frontend download logic (iOS flow) needs adjustment.

---

## Gradual Reattachment

When all five pass, reattach your real `fill-pdf` gradually:

**A)** Make `fill-pdf` return the same `HELLO_PDF_BASE64` (json) → verify.  
**B)** Switch to your real bytes but still return base64 json → verify.  
**C)** Upload bytes to Storage + return signed URL (10–45 min TTL) → verify.  
**D)** Only then add RLS data reads and authz checks → verify.

---

## Required Secrets

Make sure these are configured in Lovable → Secrets or Supabase:

- `SUPABASE_URL` = https://oogmuakyqadpynnrasnd.supabase.co
- `SUPABASE_SERVICE_ROLE_KEY` = <your service role key>
- `ALLOWED_ORIGINS` = https://98b4e1c7-7682-4f23-9f68-2a61bbec99a9.lovableproject.com,http://localhost:5173

---

## Acceptance Criteria

✅ `/health` returns `ok:true`  
✅ `/storage-test` uploads and returns a working signed URL  
✅ `/pdf-minimal` returns a valid PDF via json AND via binary stream  
✅ CORS reflects `ALLOWED_ORIGINS` (no wildcard in prod)  
✅ After green checks, you can reattach the real `fill-pdf` step-by-step
