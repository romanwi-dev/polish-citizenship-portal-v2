/**
 * Shared PDF generation utilities for Polish Citizenship Portal
 * Supports all template types with signed URLs and base64 fallback
 */

import { supabase } from './supabaseClient';

export function downloadUrl(href: string, filename?: string) {
  const a = document.createElement('a');
  a.href = href;
  if (filename) a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function base64ToBlob(b64: string, mime = 'application/pdf') {
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

async function invokeWithAuth(name: string, body: any) {
  // Get current session token
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;
  if (!token) {
    const err: any = new Error('You are not signed in');
    err.code = 'NO_SESSION';
    throw err;
  }
  return supabase.functions.invoke(name, {
    body,
    headers: { Authorization: `Bearer ${token}` },
  });
}

/** Universal PDF generator used by all forms and all template types. */
export async function generatePdfViaEdge({
  supabase: _supabase,
  caseId,
  templateType,
  toast,
  setIsGenerating,
  filename,
}: {
  supabase?: any;
  caseId: string;
  templateType: string;
  toast: any;
  setIsGenerating: (b: boolean) => void;
  filename: string;
}) {
  console.log('[PDF-LIB] generatePdfViaEdge called:', { caseId, templateType, filename });
  
  if (!caseId || caseId === ':id' || caseId === 'demo-preview') {
    console.error('[PDF-LIB] Invalid caseId, blocking PDF generation:', caseId);
    toast.error('PDF generation not available in demo mode');
    return;
  }

  try {
    setIsGenerating(true);
    toast.loading('Generating PDF...');

    console.log('[PDF-LIB] Calling fill-pdf edge function with auth');
    
    const { data, error } = await invokeWithAuth('fill-pdf', { caseId, templateType });
    
    if (error) {
      console.error('[PDF-LIB] Function error:', error);
      throw error;
    }

    console.log('[PDF-LIB] Response:', { data });

    // Prefer signed URL
    if (data?.url) {
      console.log('[PDF-LIB] Using signed URL:', data.url);
      downloadUrl(data.url, data.filename ?? filename);
      toast.dismiss();
      toast.success('PDF generated successfully!');
      return;
    }

    // Fallback to base64
    if (data?.pdf) {
      console.log('[PDF-LIB] Using base64 PDF data');
      const blob = base64ToBlob(data.pdf);
      const url = URL.createObjectURL(blob);
      downloadUrl(url, filename);
      URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('PDF generated successfully!');
      return;
    }

    if (data?.error) {
      console.error('[PDF-LIB] Server returned error:', data.error);
      throw new Error(data.error);
    }
    
    console.error('[PDF-LIB] No URL or PDF in response:', data);
    throw new Error('No URL or PDF returned from server');
  } catch (err: any) {
    toast.dismiss();
    console.error('[PDF-LIB] PDF generation error:', err);
    
    if (err?.code === 'NO_SESSION') {
      toast.error('Please sign in to generate PDFs.');
      return;
    }
    
    toast.error(`Failed to generate PDF: ${err.message ?? err}`);
  } finally {
    setIsGenerating(false);
  }
}

export async function refreshPdf(caseId: string, templateType: string) {
  const { data, error } = await invokeWithAuth('pdf-refresh', { caseId, templateType });
  if (error) throw error;
  if (!data?.url) throw new Error('No URL returned');
  return data;
}
