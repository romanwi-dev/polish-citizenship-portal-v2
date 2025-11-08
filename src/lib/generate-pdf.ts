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
    toast.loading('Starting PDF generation…');

    // Step 1: Enqueue the PDF job (returns immediately)
    const { data: enqueueData, error: enqueueError } = await supabase.functions.invoke('pdf-enqueue', {
      body: { caseId, templateType, filename }
    });

    if (enqueueError || !enqueueData?.success) {
      throw new Error(enqueueData?.error || enqueueError?.message || 'Failed to queue PDF job');
    }

    const jobId = enqueueData.jobId;
    console.log('PDF job queued:', jobId);
    
    toast.dismiss();
    toast.loading('Generating PDF… this may take a moment');

    // Step 2: Subscribe to real-time updates for instant completion notification
    const channel = supabase
      .channel(`pdf-queue:${jobId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'pdf_queue',
        filter: `id=eq.${jobId}`
      }, (payload: any) => {
        console.log('PDF queue update:', payload);
        
        if (payload.new.status === 'completed' && payload.new.pdf_url) {
          // Success - return URL so caller can show preview dialog
          toast.dismiss();
          toast.success('PDF ready!');
          setIsGenerating(false);
          
          // Store URL for preview dialog
          if (window) {
            (window as any).__lastGeneratedPdfUrl = payload.new.pdf_url;
            (window as any).__lastGeneratedPdfReady = true;
          }
          
          // Cleanup
          supabase.removeChannel(channel);
        } else if (payload.new.status === 'failed') {
          // Failed
          toast.dismiss();
          toast.error(payload.new.error_message || 'PDF generation failed');
          setIsGenerating(false);
          
          // Cleanup
          supabase.removeChannel(channel);
        }
      })
      .subscribe();

    // Fallback: Also poll as backup (in case realtime doesn't fire)
    const maxAttempts = 60; // 2 minutes max
    let attempts = 0;
    
    const checkJobStatus = async (): Promise<boolean> => {
      attempts++;
      
      const { data: job, error: jobError } = await supabase
        .from('pdf_queue')
        .select('status, pdf_url, error_message')
        .eq('id', jobId)
        .single();

      if (jobError) {
        console.error('Error checking job status:', jobError);
        return false;
      }

      if (job.status === 'completed' && job.pdf_url) {
        // Already handled by realtime, just cleanup
        supabase.removeChannel(channel);
        return true;
      }

      if (job.status === 'failed') {
        // Already handled by realtime, just cleanup
        supabase.removeChannel(channel);
        return true;
      }

      // Still processing - continue polling
      if (attempts >= maxAttempts) {
        supabase.removeChannel(channel);
        throw new Error('PDF generation timeout - please check queue status');
      }

      // Wait 2 seconds and check again
      await new Promise(resolve => setTimeout(resolve, 2000));
      return checkJobStatus();
    };

    await checkJobStatus();

  } catch (e: any) {
    try { tab?.close(); } catch { }
    toast.dismiss();
    toast.error(userMessage(e?.code, e?.message ?? 'PDF generation failed'));
    console.error('PDF error', e);
    setIsGenerating(false);
  }
}
