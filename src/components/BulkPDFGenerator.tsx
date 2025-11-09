import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, CheckCircle2, XCircle, Loader2, FileStack } from 'lucide-react';
import { useBulkPDFGeneration } from '@/hooks/useBulkPDFGeneration';
import { Badge } from '@/components/ui/badge';

interface BulkPDFGeneratorProps {
  caseId: string;
}

const templateNames: Record<string, string> = {
  'family-tree': 'Family Tree',
  'citizenship': 'Citizenship Application',
  'registration': 'Civil Registry',
};

export function BulkPDFGenerator({ caseId }: BulkPDFGeneratorProps) {
  const { generateAllPDFs, downloadPDF, isGenerating, results } = useBulkPDFGeneration(caseId);

  const handleGenerate = async () => {
    await generateAllPDFs();
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileStack className="h-6 w-6 text-primary" />
          <div>
            <CardTitle className="text-2xl">Bulk PDF Generation</CardTitle>
            <CardDescription>Generate all PDFs for this case at once</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleGenerate}
          disabled={isGenerating}
          size="lg"
          className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 text-white font-bold"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating PDFs...
            </>
          ) : (
            <>
              <FileStack className="mr-2 h-5 w-5" />
              Generate All PDFs
            </>
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-2 mt-4">
            <h4 className="font-semibold text-sm text-muted-foreground">Generation Results:</h4>
            {results.map((result) => (
              <div
                key={result.templateType}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  result.success
                    ? 'border-green-500/20 bg-green-500/5'
                    : 'border-red-500/20 bg-red-500/5'
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  {result.success ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{templateNames[result.templateType] || result.templateType}</p>
                    {result.success && result.fieldsFilledCount !== undefined && (
                      <p className="text-xs text-muted-foreground">
                        {result.fieldsFilledCount}/{result.totalFields} fields ({result.fillRate}%)
                      </p>
                    )}
                    {!result.success && result.error && (
                      <p className="text-xs text-red-500">{result.error}</p>
                    )}
                  </div>
                  {result.success && (
                    <Badge variant="secondary" className="bg-green-500/20 text-green-700">
                      {result.fillRate}% complete
                    </Badge>
                  )}
                </div>
                {result.success && result.url && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => downloadPDF(result.url!, result.templateType)}
                    className="ml-2"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
