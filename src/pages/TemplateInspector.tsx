import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Download, FileText } from 'lucide-react';

export default function TemplateInspector() {
  const [loading, setLoading] = useState(false);
  const [templateInfo, setTemplateInfo] = useState<any>(null);

  const inspectTemplate = async () => {
    setLoading(true);
    try {
      // Download the actual template file
      const { data, error } = await supabase.storage
        .from('pdf-templates')
        .download('poa-adult.pdf');

      if (error) throw error;

      // Load with pdf-lib
      const { PDFDocument } = await import('pdf-lib');
      const arrayBuffer = await data.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      const pages = pdfDoc.getPages();
      const form = pdfDoc.getForm();
      const fields = form.getFields();

      // Get page 1 details
      const page1 = pages[0];
      const { width, height } = page1.getSize();

      // Try to extract content
      const pageContent = await extractPageContent(page1);

      setTemplateInfo({
        pageCount: pages.length,
        fieldCount: fields.length,
        fileSize: arrayBuffer.byteLength,
        page1Size: { width, height },
        fields: fields.map(f => ({
          name: f.getName(),
          type: f.constructor.name
        })),
        hasContent: pageContent.length > 0,
        contentPreview: pageContent.substring(0, 500)
      });

      toast.success('Template inspected');
    } catch (error) {
      console.error('Inspection error:', error);
      toast.error('Failed to inspect template');
    } finally {
      setLoading(false);
    }
  };

  const extractPageContent = async (page: any): Promise<string> => {
    try {
      // This is a simplified extraction - pdf-lib doesn't have direct text extraction
      // But we can check if there are content streams
      const contentStream = page.node.Contents();
      return contentStream ? 'Content exists' : 'No content';
    } catch {
      return 'Unknown';
    }
  };

  const downloadTemplate = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('pdf-templates')
        .download('poa-adult.pdf');

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'poa-adult-from-storage.pdf';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Template downloaded');
    } catch (error) {
      toast.error('Failed to download template');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Template Inspector</CardTitle>
          <CardDescription>
            Inspect the POA Adult template from storage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={inspectTemplate} disabled={loading}>
              <FileText className="mr-2 h-4 w-4" />
              Inspect Template
            </Button>
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Original
            </Button>
          </div>

          {templateInfo && (
            <div className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded">
                  <div className="text-sm text-muted-foreground">File Size</div>
                  <div className="text-2xl font-bold">
                    {(templateInfo.fileSize / 1024).toFixed(0)} KB
                  </div>
                </div>
                <div className="p-4 border rounded">
                  <div className="text-sm text-muted-foreground">Pages</div>
                  <div className="text-2xl font-bold">{templateInfo.pageCount}</div>
                </div>
                <div className="p-4 border rounded">
                  <div className="text-sm text-muted-foreground">Form Fields</div>
                  <div className="text-2xl font-bold">{templateInfo.fieldCount}</div>
                </div>
                <div className="p-4 border rounded">
                  <div className="text-sm text-muted-foreground">Has Content</div>
                  <div className="text-2xl font-bold">
                    {templateInfo.hasContent ? '✅ Yes' : '❌ No'}
                  </div>
                </div>
              </div>

              <div className="p-4 border rounded">
                <div className="font-semibold mb-2">Form Fields:</div>
                <div className="space-y-1 text-sm font-mono">
                  {templateInfo.fields.map((f: any, i: number) => (
                    <div key={i}>
                      {f.name} ({f.type})
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border rounded bg-yellow-50 dark:bg-yellow-900/20">
                <div className="font-semibold mb-2">⚠️ DIAGNOSIS:</div>
                <p className="text-sm">
                  Download the original template above and open it in Adobe Acrobat or Preview.
                  If you see the Polish legal text there, then the issue is in how we're filling
                  the form. If it's blank there too, you need to re-upload the correct template.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
