/**
 * Universal PDF Generation Utilities
 * Shared helpers for all PDF generation across the app
 */

import { toast } from "sonner";

/**
 * Download a file from a URL
 */
export function downloadUrl(href: string, filename?: string) {
  const a = document.createElement('a');
  a.href = href;
  if (filename) a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/**
 * Convert base64 string to Blob
 */
export function base64ToBlob(b64: string, mime = 'application/pdf') {
  const bin = atob(b64);
  const len = bin.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/**
 * Universal PDF generator used by all forms and all template types.
 * Supports both signed URL (preferred) and base64 fallback.
 */
export async function generatePdfViaEdge({
  supabase,
  caseId,
  templateType,
  toast,
  setIsGenerating,
  filename,
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

  try {
    setIsGenerating(true);
    toast.loading('Generating PDF...');

    const { data, error } = await supabase.functions.invoke('fill-pdf', {
      body: { caseId, templateType },
    });
    
    if (error) throw error;

    // Prefer signed URL
    if (data?.url) {
      downloadUrl(data.url, data.filename ?? filename);
      toast.dismiss();
      toast.success('PDF generated successfully!');
      return;
    }

    // Fallback to base64
    if (data?.pdf) {
      const blob = base64ToBlob(data.pdf);
      const url = URL.createObjectURL(blob);
      downloadUrl(url, filename);
      URL.revokeObjectURL(url);
      toast.dismiss();
      toast.success('PDF generated successfully!');
      return;
    }

    if (data?.error) throw new Error(data.error);
    throw new Error('No URL or PDF returned from server');
  } catch (err: any) {
    toast.dismiss();
    console.error('PDF generation error:', err);
    toast.error(`Failed to generate PDF: ${err.message ?? err}`);
  } finally {
    setIsGenerating(false);
  }
}
