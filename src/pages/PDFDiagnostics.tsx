import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { diagnosePDFTemplate } from '@/utils/pdfDiagnostics';
import { toast } from 'sonner';

export default function PDFDiagnostics() {
  const [results, setResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<string | null>(null);

  const templates = [
    'poa-adult',
    'poa-minor',
    'poa-spouses',
    'citizenship',
    'family-tree',
    'umiejscowienie',
    'uzupelnienie',
  ];

  const diagnoseTemplate = async (templateName: string) => {
    setLoading(templateName);
    try {
      const result = await diagnosePDFTemplate(templateName);
      setResults(prev => ({ ...prev, [templateName]: result }));
      
      if (!result.hasContent) {
        toast.error(`${templateName}: No content found!`);
      } else {
        toast.success(`${templateName}: Has content`);
      }
    } catch (error) {
      toast.error(`Failed to diagnose ${templateName}`);
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  const diagnoseAll = async () => {
    for (const template of templates) {
      await diagnoseTemplate(template);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">PDF Template Diagnostics</h1>
        <p className="text-muted-foreground">
          Check if your PDF templates contain actual content or are just empty forms
        </p>
      </div>

      <div className="mb-6">
        <Button onClick={diagnoseAll} disabled={loading !== null}>
          Diagnose All Templates
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.map(template => {
          const result = results[template];
          return (
            <Card key={template}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5" />
                    <div>
                      <CardTitle className="text-lg">{template}.pdf</CardTitle>
                      {result && (
                        <CardDescription>
                          {result.pageCount} page{result.pageCount !== 1 ? 's' : ''} • {result.fieldCount} fields • {(result.fileSize / 1024).toFixed(0)}KB
                        </CardDescription>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => diagnoseTemplate(template)}
                    disabled={loading === template}
                    variant="outline"
                    size="sm"
                  >
                    {loading === template ? 'Checking...' : 'Check'}
                  </Button>
                </div>
              </CardHeader>

              {result && (
                <CardContent>
                  <div className={`flex items-start gap-3 p-4 rounded-lg ${
                    result.hasContent 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : 'bg-destructive/10 border border-destructive/20'
                  }`}>
                    {result.hasContent ? (
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <p className={result.hasContent ? 'text-green-700 dark:text-green-400' : 'text-destructive'}>
                        {result.diagnosis}
                      </p>
                      {!result.hasContent && (
                        <div className="mt-3 text-sm">
                          <p className="font-semibold mb-2">What you need to do:</p>
                          <ol className="list-decimal list-inside space-y-1 ml-2">
                            <li>Get the ACTUAL Polish POA template with all legal text printed</li>
                            <li>Add form fields to it using Adobe Acrobat or similar tool</li>
                            <li>Upload it to replace this blank template</li>
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
