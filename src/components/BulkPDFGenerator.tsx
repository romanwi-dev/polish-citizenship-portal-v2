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
      <div className="flex justify-center items-center py-6 md:py-8">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          size="lg"
          className="text-lg md:text-2xl font-bold px-8 py-4 md:px-20 md:py-6 h-auto min-h-[48px] rounded-lg bg-red-700 dark:bg-red-900/60 hover:bg-red-800 dark:hover:bg-red-900/70 text-white shadow-[0_0_40px_rgba(185,28,28,0.6)] dark:shadow-[0_0_40px_rgba(127,29,29,0.6)] hover:shadow-[0_0_60px_rgba(185,28,28,0.8)] dark:hover:shadow-[0_0_60px_rgba(127,29,29,0.8)] group relative overflow-hidden backdrop-blur-md border-2 border-red-600 dark:border-red-800/40 hover:border-red-500 dark:hover:border-red-700/60 transition-all duration-300 hover:scale-105"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin mr-3 relative z-10" />
              <span className="relative z-10 font-bold drop-shadow-lg">Generating...</span>
            </>
          ) : (
            <span className="relative z-10 font-bold drop-shadow-lg">Generate Documents</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-red-800/30 to-red-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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

