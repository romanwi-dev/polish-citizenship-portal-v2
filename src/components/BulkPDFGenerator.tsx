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
        className="h-40 px-24 flex items-center justify-center border-2 hover:bg-gradient-to-br hover:from-black hover:to-red-950 hover:text-white transition-all text-lg font-bold"
      >
        {isGenerating ? (
          <span className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-xl font-bold">Generating...</span>
          </span>
        ) : (
          <span className="text-xl font-bold">Generate Documents</span>
        )}
      </Button>
    </div>
  );
}
