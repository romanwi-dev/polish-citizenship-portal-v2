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
        className="h-28 px-16 flex items-center justify-center border-2 hover:bg-primary hover:text-primary-foreground transition-all"
      >
        {isGenerating ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-base font-medium">Generating...</span>
          </span>
        ) : (
          <span className="text-base font-medium">Generate Documents</span>
        )}
      </Button>
    </div>
  );
}
