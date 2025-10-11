import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, CheckCircle, XCircle, Loader2, Eye, Download } from 'lucide-react';
import { PDFPreviewDialog } from '@/components/PDFPreviewDialog';

const TEMPLATES = [
  { file: 'poa-adult', display: 'POA - Adult' },
  { file: 'poa-minor', display: 'POA - Minor' },
  { file: 'poa-spouses', display: 'POA - Spouses' },
  { file: 'citizenship', display: 'Citizenship Application' },
  { file: 'family-tree', display: 'Family Tree' },
  { file: 'umiejscowienie', display: 'Registration (Umiejscowienie)' },
  { file: 'uzupelnienie', display: 'Supplement (Uzupełnienie)' },
];

export default function UploadPDFTemplates() {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<Record<string, 'success' | 'error' | 'pending'>>({});
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');

  const uploadAllTemplates = async () => {
    setUploading(true);
    const newResults: Record<string, 'success' | 'error' | 'pending'> = {};

    for (const template of TEMPLATES) {
      try {
        newResults[template.file] = 'pending';
        setResults({ ...newResults });

        // Fetch PDF from public folder
        const response = await fetch(`/templates/${template.file}.pdf`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${template.file}.pdf`);
        }

        const blob = await response.blob();

        // Upload to Supabase Storage
        const { error } = await supabase.storage
          .from('pdf-templates')
          .upload(`${template.file}.pdf`, blob, {
            upsert: true,
            contentType: 'application/pdf',
          });

        if (error) throw error;

        newResults[template.file] = 'success';
        setResults({ ...newResults });
        toast.success(`Uploaded ${template.display}`);
      } catch (error) {
        console.error(`Error uploading ${template.file}:`, error);
        newResults[template.file] = 'error';
        setResults({ ...newResults });
        toast.error(`Failed to upload ${template.display}`);
      }
    }

    setUploading(false);
    toast.success('Upload process complete!');
  };

  const handlePreviewPDF = async (templateFile: string, displayName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('pdf-templates')
        .download(`${templateFile}.pdf`);

      if (error) throw error;

      // Convert to base64 for reliable preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
        setPreviewTitle(displayName);
        setPreviewOpen(true);
      };
      reader.onerror = () => {
        toast.error('Failed to prepare PDF preview');
      };
      reader.readAsDataURL(data);
    } catch (error) {
      console.error('Preview error:', error);
      toast.error(`Failed to preview: ${error.message}`);
    }
  };

  const handleDownloadPDF = async (templateFile: string, displayName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('pdf-templates')
        .download(`${templateFile}.pdf`);

      if (error) throw error;

      // Create download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${templateFile}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded ${displayName}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Failed to download ${displayName}`);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Upload PDF Templates to Storage</h1>
        <p className="text-muted-foreground mb-6">
          This will upload all 7 PDF templates from the public/templates folder to Supabase Storage.
        </p>

        <Button
          onClick={uploadAllTemplates}
          disabled={uploading}
          className="mb-6"
        >
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Upload All Templates
            </>
          )}
        </Button>

        <div className="space-y-2">
          {TEMPLATES.map((template) => (
            <div
              key={template.file}
              className="flex items-center justify-between p-3 border rounded gap-3"
            >
              <span className="flex-1">
                <span className="font-semibold">{template.display}</span>
                <span className="text-xs text-muted-foreground ml-2">({template.file}.pdf)</span>
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadPDF(template.file, template.display)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreviewPDF(template.file, template.display)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
                {results[template.file] === 'success' && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                {results[template.file] === 'error' && (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                {results[template.file] === 'pending' && (
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <PDFPreviewDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        pdfUrl={previewUrl}
        onDownload={() => {
          const link = document.createElement('a');
          link.href = previewUrl;
          link.download = `${previewTitle}.pdf`;
          link.click();
        }}
        documentTitle={previewTitle}
      />
    </div>
  );
}
