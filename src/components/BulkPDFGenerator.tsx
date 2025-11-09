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
          className="text-3xl md:text-5xl font-heading font-black px-12 py-6 md:px-24 md:py-10 h-auto min-h-[60px] rounded-lg bg-blue-900/60 hover:bg-blue-900/80 text-white shadow-[0_0_40px_rgba(59,130,246,0.6)] hover:shadow-[0_0_60px_rgba(59,130,246,0.8)] group relative overflow-hidden backdrop-blur-md border-2 border-blue-600/40 hover:border-blue-500/60 transition-all duration-300 hover:scale-105"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-8 w-8 md:h-10 md:w-10 animate-spin mr-4 relative z-10" />
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-lg">
                Generating...
              </span>
            </>
          ) : (
            <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent drop-shadow-lg">
              Generate Documents
            </span>
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-800/30 to-blue-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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

