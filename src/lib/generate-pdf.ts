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

async function tryOpenUrlWithRefresh({ tab, href, refresh, filename }: { 
  tab: Window|null; 
  href: string; 
  refresh: () => Promise<{ url:string }>; 
  filename?: string; 
}) {
  // First attempt
  redirectTab(tab, href);

  // Heuristic: if it errors (expired/blocked), fetch head to verify
  try {
    const head = await fetch(href, { method: 'HEAD' });
    if (head.status === 403 || head.status === 401) {
      const fresh = await refresh();
      redirectTab(tab, fresh.url);
    }
  } catch {
    // Network flakes: attempt refresh once
    try {
      const fresh = await refresh();
      redirectTab(tab, fresh.url);
    } catch (e) {
      // If refresh also fails, let original error stand
      console.error('URL refresh failed:', e);
    }
  }
}

export async function generatePdf({ 
  supabase, 
  caseId, 
  templateType, 
  toast, 
  setIsGenerating, 
  filename 
}:{
  supabase:any; 
  caseId:string; 
  templateType:string; 
  toast:any; 
  setIsGenerating:(b:boolean)=>void; 
  filename:string;
}) {
  if (!caseId || caseId === ':id' || caseId === 'demo-preview') {
    toast.error('PDF generation not available in demo mode'); 
    return;
  }
  
  const ios = isIOS();
  const tab = ios ? preOpenTab() : null;

  try {
    setIsGenerating(true);
    toast.loading('Generating PDF...');

    const { data, error } = await supabase.functions.invoke('fill-pdf', { 
      body: { caseId, templateType }
    });
    
    if (error) throw error;

    if (data?.url) {
      await tryOpenUrlWithRefresh({
        tab,
        href: data.url,
        filename,
        refresh: async () => {
          const r = await supabase.functions.invoke('pdf-refresh', { 
            body: { caseId, templateType }
          });
          if (r.error || !r.data?.url) throw new Error('Failed to refresh URL');
          return { url: r.data.url };
        }
      });
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

    if (data?.error) throw new Error(data.error);
    throw new Error('No URL or PDF returned');
  } catch (e:any) {
    try { tab?.close(); } catch {}
    toast.dismiss();
    toast.error(e?.message ?? 'PDF failed');
  } finally {
    setIsGenerating(false);
  }
}
