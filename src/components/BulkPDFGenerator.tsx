import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useBulkPDFGeneration } from '@/hooks/useBulkPDFGeneration';

interface BulkPDFGeneratorProps {
  caseId: string;
}

export function BulkPDFGenerator({ caseId }: BulkPDFGeneratorProps) {
  const { generateAllPDFs, isGenerating } = useBulkPDFGeneration(caseId);

  const handleGenerate = async () => {
    await generateAllPDFs();
  };

  return (
    <div className="flex justify-center items-center py-6">
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        variant="outline"
        className="h-20 px-8 flex flex-col items-center justify-center gap-2 border-2 hover:bg-primary hover:text-primary-foreground transition-all"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-xs font-medium">Generating...</span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs font-medium">Generate All PDFs</span>
          </>
        )}
      </Button>
    </div>
  );
}
