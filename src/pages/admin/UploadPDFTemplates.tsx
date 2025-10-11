import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const TEMPLATES = [
  'poa-adult',
  'poa-minor',
  'poa-spouses',
  'citizenship',
  'family-tree',
  'umiejscowienie',
  'uzupelnienie',
];

export default function UploadPDFTemplates() {
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<Record<string, 'success' | 'error' | 'pending'>>({});

  const uploadAllTemplates = async () => {
    setUploading(true);
    const newResults: Record<string, 'success' | 'error' | 'pending'> = {};

    for (const template of TEMPLATES) {
      try {
        newResults[template] = 'pending';
        setResults({ ...newResults });

        // Fetch PDF from public folder
        const response = await fetch(`/templates/${template}.pdf`);
        if (!response.ok) {
          throw new Error(`Failed to fetch ${template}.pdf`);
        }

        const blob = await response.blob();

        // Upload to Supabase Storage
        const { error } = await supabase.storage
          .from('pdf-templates')
          .upload(`${template}.pdf`, blob, {
            upsert: true,
            contentType: 'application/pdf',
          });

        if (error) throw error;

        newResults[template] = 'success';
        setResults({ ...newResults });
        toast.success(`Uploaded ${template}.pdf`);
      } catch (error) {
        console.error(`Error uploading ${template}:`, error);
        newResults[template] = 'error';
        setResults({ ...newResults });
        toast.error(`Failed to upload ${template}.pdf`);
      }
    }

    setUploading(false);
    toast.success('Upload process complete!');
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
              key={template}
              className="flex items-center justify-between p-3 border rounded"
            >
              <span className="font-mono">{template}.pdf</span>
              {results[template] === 'success' && (
                <CheckCircle className="h-5 w-5 text-green-500" />
              )}
              {results[template] === 'error' && (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              {results[template] === 'pending' && (
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
