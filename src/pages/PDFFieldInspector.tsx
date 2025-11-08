import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { inspectFamilyTreePDF } from '@/utils/inspectFamilyTreePDF';

export default function PDFFieldInspector() {
  const [fields, setFields] = useState<Array<{ name: string; type: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runInspection = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await inspectFamilyTreePDF();
      setFields(result.fields);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runInspection();
  }, []);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Family Tree PDF Field Inspector</h1>
        <p className="text-muted-foreground mb-6">
          Extracting actual field names from family-tree.pdf template
        </p>

        <Button onClick={runInspection} disabled={loading} className="mb-6">
          {loading ? 'Inspecting...' : 'Re-run Inspection'}
        </Button>

        {error && (
          <Card className="p-4 bg-destructive/10 border-destructive mb-6">
            <p className="text-destructive font-semibold">Error: {error}</p>
          </Card>
        )}

        {fields.length > 0 && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">
              Found {fields.length} PDF Fields
            </h2>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {fields.map((field, idx) => (
                <div key={idx} className="flex justify-between p-2 bg-muted rounded">
                  <code className="text-sm font-mono">{field.name}</code>
                  <span className="text-xs text-muted-foreground">{field.type}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-primary/10 rounded">
              <h3 className="font-bold mb-2">Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li>Copy these field names</li>
                <li>Update src/config/pdfMappings/familyTree.ts</li>
                <li>Update supabase/functions/_shared/mappings/family-tree.ts</li>
                <li>Test PDF generation</li>
              </ol>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
