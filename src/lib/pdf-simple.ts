/**
 * Simple PDF generation - no queues, no complexity
 */

import { supabase } from "@/integrations/supabase/client";

export async function generateSimplePDF({
  caseId,
  templateType,
  toast,
  setIsGenerating
}: {
  caseId: string;
  templateType: string;
  toast: any;
  setIsGenerating: (val: boolean) => void;
}): Promise<string | null> {
  
  const effectiveCaseId = (caseId && caseId !== ':id' && caseId !== 'demo-preview') 
    ? caseId 
    : 'blank-template';

  const operationId = `pdf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    setIsGenerating(true);
    toast.loading('Generating PDF...');

    console.log('[pdf-simple] Starting transaction:', { operationId, caseId: effectiveCaseId, templateType });

    const { data, error } = await supabase.functions.invoke('pdf-simple', {
      body: { 
        caseId: effectiveCaseId, 
        templateType,
        operationId 
      }
    });

    console.log('[pdf-simple] Response:', { success: data?.success, error });

    if (error) {
      console.error('[pdf-simple] Edge function error:', error);
      throw new Error(`PDF generation failed: ${error.message}`);
    }

    if (!data?.success) {
      console.error('[pdf-simple] Generation failed:', data);
      throw new Error(data?.error || 'PDF generation failed');
    }

    // Validation: Ensure PDF was actually created
    if (!data.url) {
      throw new Error('PDF URL not returned - generation may have failed silently');
    }

    if (data.fieldsFilledCount === undefined || data.totalFields === undefined) {
      console.warn('[pdf-simple] Missing field count metadata');
    }

    toast.dismiss();
    const message = data.fieldsFilledCount === 0 
      ? 'Blank PDF ready for manual completion'
      : `PDF ready! Filled ${data.fieldsFilledCount}/${data.totalFields} fields (${data.fillRate}%)`;
    toast.success(message);
    
    console.log('[pdf-simple] Transaction complete:', { operationId, url: data.url });
    
    return data.url;

  } catch (error: any) {
    console.error('[pdf-simple] Transaction failed:', { operationId, error: error.message });
    
    toast.dismiss();
    toast.error(error.message || 'PDF generation failed');
    
    return null;
  } finally {
    setIsGenerating(false);
  }
}
