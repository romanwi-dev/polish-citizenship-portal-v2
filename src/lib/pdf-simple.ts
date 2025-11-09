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
  
  // Allow PDF generation in any mode - use 'blank-template' for invalid caseIds
  const effectiveCaseId = (caseId && caseId !== ':id' && caseId !== 'demo-preview') 
    ? caseId 
    : 'blank-template';

  try {
    setIsGenerating(true);
    toast.loading('Generating PDF...');

    console.log('[pdf-simple] Calling edge function:', { caseId: effectiveCaseId, templateType });

    const { data, error } = await supabase.functions.invoke('pdf-simple', {
      body: { caseId: effectiveCaseId, templateType }
    });

    console.log('[pdf-simple] Edge function response:', { data, error });

    if (error) {
      console.error('[pdf-simple] Error:', error);
      throw new Error(error.message);
    }

    if (!data?.success) {
      console.error('[pdf-simple] Generation failed:', data);
      throw new Error(data?.error || 'PDF generation failed');
    }

    toast.dismiss();
    const message = data.fieldsFilledCount === 0 
      ? 'Blank PDF ready for manual completion'
      : `PDF ready! Filled ${data.fieldsFilledCount}/${data.totalFields} fields (${data.fillRate}%)`;
    toast.success(message);
    
    console.log('[pdf-simple] Success - returning URL:', data.url);
    
    return data.url;

  } catch (error: any) {
    toast.dismiss();
    toast.error('PDF generation failed: ' + error.message);
    console.error('[pdf-simple] Failed:', error);
    return null;
  } finally {
    setIsGenerating(false);
  }
}
