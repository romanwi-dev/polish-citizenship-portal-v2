import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, FileEdit, CheckCircle2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export default function RenamePDFFields() {
  const [templateType, setTemplateType] = useState<'umiejscowienie' | 'uzupelnienie' | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleRenameFields = async () => {
    if (!templateType) {
      toast({
        title: "Select Template",
        description: "Please select a template to rename",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('rename-pdf-fields', {
        body: { templateType },
      });

      if (error) throw error;

      setResult(data);

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
      } else {
        toast({
          title: "Processing Complete with Issues",
          description: "Some fields could not be renamed. See details below.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error renaming PDF fields:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to rename PDF fields",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Rename PDF Form Fields</h1>
        <p className="text-muted-foreground">
          Update Polish field names to English equivalents in Civil Registry templates
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Select Template</CardTitle>
          <CardDescription>
            Choose which PDF template to rename. This will update all form field names from Polish to English.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Template Type</label>
              <Select 
                value={templateType} 
                onValueChange={(value: 'umiejscowienie' | 'uzupelnienie') => setTemplateType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="umiejscowienie">
                    Umiejscowienie (Civil Registry Entry)
                  </SelectItem>
                  <SelectItem value="uzupelnienie">
                    Uzupełnienie (Civil Registry Supplement)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={handleRenameFields}
              disabled={!templateType || isProcessing}
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Rename Fields
                </>
              )}
            </Button>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> This will create a new PDF file with renamed fields. 
              The original template will remain unchanged. After renaming, you'll need to replace 
              the original template with the renamed version in the PDF templates storage.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              Processing Results
            </CardTitle>
            <CardDescription>
              Template: <strong>{result.templateType}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-primary">{result.totalFields}</div>
                <div className="text-sm text-muted-foreground">Total Fields</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">{result.renamedCount}</div>
                <div className="text-sm text-muted-foreground">Renamed</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {result.skippedFields?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Skipped</div>
              </div>
            </div>

            {result.renamedFields && result.renamedFields.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Renamed Fields ({result.renamedFields.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                  {result.renamedFields.map((field: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="font-mono text-xs">
                        {field.oldName}
                      </Badge>
                      <span>→</span>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {field.newName}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.skippedFields && result.skippedFields.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Skipped Fields ({result.skippedFields.length})
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto border rounded-lg p-3">
                  {result.skippedFields.map((field: any, index: number) => (
                    <div key={index} className="text-sm">
                      <div className="font-mono font-semibold">{field.name}</div>
                      <div className="text-muted-foreground text-xs">{field.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                The renamed PDF has been saved as <strong>{result.templateType}-renamed.pdf</strong> in 
                the pdf-templates storage bucket. Review the changes and replace the original template 
                if everything looks correct.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
