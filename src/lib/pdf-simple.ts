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
  
  if (!caseId || caseId === ':id' || caseId === 'demo-preview') {
    toast.error('PDF generation not available in demo mode');
    return null;
  }

  try {
    setIsGenerating(true);
    toast.loading('Generating PDF...');

    console.log('[pdf-simple] Calling edge function:', { caseId, templateType });

    const { data, error } = await supabase.functions.invoke('pdf-simple', {
      body: { caseId, templateType }
    });

    if (error) {
      console.error('[pdf-simple] Error:', error);
      throw new Error(error.message);
    }

    if (!data?.success) {
      console.error('[pdf-simple] Generation failed:', data);
      throw new Error(data?.error || 'PDF generation failed');
    }

    toast.dismiss();
    toast.success(`PDF ready! Filled ${data.fieldsFilledCount}/${data.totalFields} fields (${data.fillRate}%)`);
    
    console.log('[pdf-simple] Success:', data);
    
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
