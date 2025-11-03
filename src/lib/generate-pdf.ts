/**
 * Production-ready PDF generation with auto-refresh on expired URLs
 */

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function preOpenTab() {
  const tab = window.open('', '_blank');
  if (tab) {
    tab.document.write('Loading PDF...');
  }
  return tab;
}

function redirectTab(tab: Window | null, href: string) {
  if (tab && !tab.closed) {
    tab.location.href = href;
  } else {
    window.open(href, '_blank');
  }
}

function base64ToDataUrl(b64: string, mime = 'application/pdf') {
  return `data:${mime};base64,${b64}`;
}

function userMessage(code?: string, fallback = 'PDF generation failed') {
  switch (code) {
    case 'INVALID_CASE_ID': return 'Incorrect case number.';
    case 'INVALID_TEMPLATE': return 'Unknown document type.';
    case 'CASE_NOT_FOUND': return 'Case not found or you have no access.';
    case 'FORBIDDEN': return 'You are not allowed to access this case.';
    case 'RATE_LIMIT': return 'Too many requests. Please try again in a few minutes.';
    case 'UPLOAD_FAIL': return 'Could not save the file. Please try again.';
    case 'SIGN_FAIL': return 'Could not prepare the download link. Please try again.';
    case 'GEN_FAIL': return 'Document generator reported an error.';
    case 'DATA_FETCH_FAIL': return 'Could not fetch case data.';
    case 'TEMPLATE_DOWNLOAD_FAIL': return 'Could not load PDF template.';
    default: return fallback;
  }
}

async function refreshUrl(supabase: any, caseId: string, templateType: string) {
  const r = await supabase.functions.invoke('pdf-refresh', { body: { caseId, templateType } });
  if (r.error || !r.data?.url) throw new Error('Refresh failed');
  return r.data.url;
}

export async function generatePdf({
  supabase,
  caseId,
  templateType,
  toast,
  setIsGenerating,
  filename
}: {
  supabase: any;
  caseId: string;
  templateType: string;
  toast: any;
  setIsGenerating: (b: boolean) => void;
  filename: string;
}) {
  if (!caseId || caseId === ':id' || caseId === 'demo-preview') {
    toast.error('PDF generation not available in demo mode');
    return;
  }

  const ios = isIOS();
  const tab = ios ? preOpenTab() : null;

  try {
    setIsGenerating(true);
    toast.loading('Preparing your PDF…');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/fill-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ caseId, templateType }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();

    if (data?.url) {
      redirectTab(tab, data.url);

      // HEAD ping — refresh on 401/403/0
      try {
        const head = await fetch(data.url, { method: 'HEAD' });
        if (head.status === 401 || head.status === 403) {
          const fresh = await refreshUrl(supabase, caseId, templateType);
          redirectTab(tab, fresh);
        }
      } catch {
        const fresh = await refreshUrl(supabase, caseId, templateType);
        redirectTab(tab, fresh);
      }

      toast.dismiss();
      toast.success('PDF ready');
      return;
    }

    if (data?.pdf) {
      const href = base64ToDataUrl(data.pdf);
      redirectTab(tab, href);
      toast.dismiss();
      toast.success('PDF ready');
      return;
    }

    if (data?.code || data?.message) {
      throw { message: data.message, code: data.code };
    }
    throw new Error('No URL or PDF returned');
  } catch (e: any) {
    try { tab?.close(); } catch { }
    toast.dismiss();
    toast.error(userMessage(e?.code, e?.message ?? 'PDF generation failed'));
    console.error('PDF error', e);
  } finally {
    setIsGenerating(false);
  }
}
