import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, FileSearch } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type TemplateType = 'poa-adult' | 'poa-minor' | 'poa-spouses' | 'citizenship' | 'family-tree' | 'uzupelnienie';

interface FieldInfo {
  name: string;
  type: string;
}

interface InspectionResult {
  templateType: string;
  templateUrl: string;
  totalFields: number;
  fields: FieldInfo[];
}

export default function PDFInspector() {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('poa-adult');
  const [isInspecting, setIsInspecting] = useState(false);
  const [result, setResult] = useState<InspectionResult | null>(null);

  const templateLabels: Record<TemplateType, string> = {
    'poa-adult': 'POA Adult',
    'poa-minor': 'POA Minor',
    'poa-spouses': 'POA Spouses',
    'citizenship': 'Citizenship (OBY)',
    'family-tree': 'Family Tree',
    'uzupelnienie': 'Uzupełnienie',
  };

  const handleInspect = async () => {
    setIsInspecting(true);
    try {
      const { data, error } = await supabase.functions.invoke('pdf-field-inspector', {
        body: { templateType: selectedTemplate }
      });

      if (error) throw error;

      setResult(data);
      toast.success(`Found ${data.totalFields} fields in ${templateLabels[selectedTemplate]}`);
    } catch (error: any) {
      console.error('Inspection error:', error);
      toast.error(`Failed to inspect PDF: ${error.message}`);
      setResult(null);
    } finally {
      setIsInspecting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">PDF Field Inspector</h1>
        <p className="text-muted-foreground">
          Inspect form field names in your PDF templates to verify mappings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Template</CardTitle>
          <CardDescription>
            Choose a PDF template to inspect its form field names
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={selectedTemplate} onValueChange={(v) => setSelectedTemplate(v as TemplateType)}>
              <SelectTrigger className="w-[300px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(templateLabels) as [TemplateType, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleInspect} disabled={isInspecting}>
              {isInspecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Inspecting...
                </>
              ) : (
                <>
                  <FileSearch className="mr-2 h-4 w-4" />
                  Inspect Fields
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Inspection Results</span>
              <Badge variant="outline">{result.totalFields} fields</Badge>
            </CardTitle>
            <CardDescription>
              Template: {templateLabels[selectedTemplate]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 max-h-[600px] overflow-y-auto">
                {result.fields.map((field, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg bg-muted/50"
                  >
                    <code className="text-sm font-mono">{field.name}</code>
                    <Badge variant="secondary" className="ml-2">
                      {field.type.replace('PDF', '')}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
