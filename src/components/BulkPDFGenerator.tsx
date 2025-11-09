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
      <div className="flex justify-center items-center -mt-10 mb-6 md:-mt-16 md:mb-8">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          size="lg"
          className="text-2xl md:text-3xl font-heading font-black px-8 py-4 md:px-16 md:py-6 h-auto min-h-[48px] rounded-lg bg-blue-900/60 hover:bg-blue-900/80 text-white backdrop-blur-md border-2 border-blue-600/40 hover:border-blue-500/60 transition-colors duration-300"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-6 w-6 md:h-8 md:w-8 animate-spin mr-3" />
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-lg">
                Generating...
              </span>
            </>
          ) : (
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-lg">
              Generate Papers
            </span>
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

