import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useBulkPDFGeneration } from '@/hooks/useBulkPDFGeneration';
import { BulkPDFResultsModal } from './BulkPDFResultsModal';

interface BulkPDFGeneratorProps {
  caseId: string;
}

export function BulkPDFGenerator({ caseId }: BulkPDFGeneratorProps) {
  const { generateAllPDFs, downloadPDF, isGenerating, results } = useBulkPDFGeneration(caseId);
  const [showResults, setShowResults] = useState(false);

  const handleGenerate = async () => {
    const result = await generateAllPDFs();
    if (result) {
      setShowResults(true);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center py-4">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          variant="outline"
          className="h-48 px-32 flex items-center justify-center border-2 border-red-500/40 hover:bg-gradient-to-br hover:from-black hover:to-red-950 hover:text-white transition-all shadow-[0_0_30px_rgba(239,68,68,0.4)] hover:shadow-[0_0_60px_rgba(239,68,68,0.8)] hover:border-red-500"
        >
          {isGenerating ? (
            <span className="flex items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg font-normal">Generating...</span>
            </span>
          ) : (
            <span className="text-lg font-normal">Generate Documents</span>
          )}
        </Button>
      </div>

      <BulkPDFResultsModal
        open={showResults}
        onClose={() => setShowResults(false)}
        results={results}
        onDownload={downloadPDF}
      />
    </>
  );
}

