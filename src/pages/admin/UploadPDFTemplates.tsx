import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, CheckCircle, XCircle, Loader2, Eye } from 'lucide-react';

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

  const handlePreviewPDF = async (templateFile: string) => {
    // Get public URL from Supabase Storage instead of public folder
    const { data } = supabase.storage
      .from('pdf-templates')
      .getPublicUrl(`${templateFile}.pdf`);
    
    if (data?.publicUrl) {
      window.open(data.publicUrl, '_blank');
    } else {
      toast.error('Could not load PDF preview');
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
                  onClick={() => handlePreviewPDF(template.file)}
                  className="flex items-center gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview PDF
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
    </div>
  );
}
