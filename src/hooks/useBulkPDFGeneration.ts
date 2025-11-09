import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PDFResult {
  templateType: string;
  success: boolean;
  url?: string;
  error?: string;
  fieldsFilledCount?: number;
  totalFields?: number;
  fillRate?: number;
}

interface BulkGenerationResult {
  success: boolean;
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
  results: PDFResult[];
}

export function useBulkPDFGeneration(caseId: string) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [results, setResults] = useState<PDFResult[]>([]);

  const generateAllPDFs = async (): Promise<BulkGenerationResult | null> => {
    if (!caseId || caseId === ':id' || caseId === 'demo-preview') {
      toast.error('Invalid case ID');
      return null;
    }

    setIsGenerating(true);
    setProgress('Starting bulk PDF generation...');
    setResults([]);

    const loadingToast = toast.loading('Generating all PDFs...');

    try {
      console.log('[useBulkPDFGeneration] Calling bulk-generate-pdfs for case:', caseId);

      const { data, error } = await supabase.functions.invoke('bulk-generate-pdfs', {
        body: { caseId }
      });

      if (error) {
        console.error('[useBulkPDFGeneration] Error:', error);
        toast.dismiss(loadingToast);
        toast.error(`Bulk generation failed: ${error.message}`);
        setProgress('Failed');
        return null;
      }

      if (!data?.success) {
        console.error('[useBulkPDFGeneration] Generation failed:', data);
        toast.dismiss(loadingToast);
        toast.error(data?.error || 'Bulk generation failed');
        setProgress('Failed');
        return null;
      }

      toast.dismiss(loadingToast);
      
      const { summary, results: pdfResults } = data;
      setResults(pdfResults);
      setProgress('Complete');

      if (summary.successful === summary.total) {
        toast.success(`All ${summary.total} PDFs generated successfully! 🎉`);
      } else if (summary.successful > 0) {
        toast.warning(`Generated ${summary.successful}/${summary.total} PDFs. ${summary.failed} failed.`);
      } else {
        toast.error(`All PDF generations failed`);
      }

      console.log('[useBulkPDFGeneration] Results:', data);
      return data;

    } catch (error: any) {
      console.error('[useBulkPDFGeneration] Exception:', error);
      toast.dismiss(loadingToast);
      toast.error(`Bulk generation failed: ${error.message}`);
      setProgress('Error');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = (url: string, templateType: string) => {
    if (!url) return;
    window.open(url, '_blank');
    toast.success(`Downloading ${templateType} PDF`);
  };

  return {
    generateAllPDFs,
    downloadPDF,
    isGenerating,
    progress,
    results
  };
}
