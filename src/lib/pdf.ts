/**
 * @deprecated Use @/lib/generate-pdf instead
 * This file contains legacy synchronous PDF generation
 * All new code should use the async queue system in generate-pdf.ts
 * 
 * ⚠️ CRITICAL: DO NOT USE FUNCTIONS FROM THIS FILE
 * All PDF generation MUST use the async queue via @/lib/generate-pdf
 */

// Runtime validation - throw error in development if legacy functions are called
if (import.meta.env.DEV) {
  console.error('🚨 LEGACY PDF GENERATION DETECTED!');
  console.error('This file is deprecated. Use generatePdf() from @/lib/generate-pdf instead.');
  console.trace('Called from:');
}

import { supabase } from '@/integrations/supabase/client';

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

/** Universal PDF generator - V2 with fallback */
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
  if (!caseId || caseId === ':id' || caseId === 'demo-preview') {
    toast.error('Invalid case ID');
    return;
  }

  try {
    setIsGenerating(true);
    toast.loading('Generating PDF...');
    
    // Try V2 endpoint first (fresh deployment)
    let data, error;
    try {
      const v2Response = await supabase.functions.invoke('pdf-generate-v2', {
        body: { caseId, templateType }
      });
      data = v2Response.data;
      error = v2Response.error;
    } catch (v2Error) {
      console.log('V2 failed, falling back to fill-pdf:', v2Error);
      // Fallback to original
      const v1Response = await supabase.functions.invoke('fill-pdf', {
        body: { caseId, templateType }
      });
      data = v1Response.data;
      error = v1Response.error;
    }
    
    if (error) throw error;

    if (data?.url) {
      downloadUrl(data.url, data.filename ?? filename);
      toast.dismiss();
      toast.success('PDF generated!');
      return;
    }

    if (data?.pdf) {
      const blob = base64ToBlob(data.pdf);
      const url = URL.createObjectURL(blob);
      downloadUrl(url, filename);
      URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('PDF generated!');
      return;
    }

    if (data?.error) throw new Error(data.error);
    throw new Error('No PDF returned');
  } catch (err: any) {
    toast.dismiss();
    toast.error(`PDF failed: ${err.message ?? err}`);
  } finally {
    setIsGenerating(false);
  }
}

export async function refreshPdf(caseId: string, templateType: string) {
  const { data, error } = await supabase.functions.invoke('pdf-refresh', { 
    body: { caseId, templateType } 
  });
  if (error) throw error;
  if (!data?.url) throw new Error('No URL returned');
  return data;
}
