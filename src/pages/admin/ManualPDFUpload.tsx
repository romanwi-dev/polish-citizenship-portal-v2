import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const TEMPLATE_TYPES = [
  { key: 'poa-adult', label: 'POA - Adult' },
  { key: 'poa-minor', label: 'POA - Minor' },
  { key: 'poa-spouses', label: 'POA - Spouses' },
  { key: 'citizenship', label: 'Citizenship Application' },
  { key: 'family-tree', label: 'Family Tree' },
  { key: 'umiejscowienie', label: 'Registration (Umiejscowienie)' },
  { key: 'uzupelnienie', label: 'Supplement (Uzupełnienie)' },
];

export default function ManualPDFUpload() {
  const [files, setFiles] = useState<Record<string, File>>({});
  const [uploadStatus, setUploadStatus] = useState<Record<string, 'idle' | 'uploading' | 'success' | 'error'>>({});

  const handleFileSelect = (templateKey: string, file: File | null) => {
    if (file) {
      if (file.type !== 'application/pdf') {
        toast.error('Please select a PDF file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File must be less than 10MB');
        return;
      }
      setFiles(prev => ({ ...prev, [templateKey]: file }));
      setUploadStatus(prev => ({ ...prev, [templateKey]: 'idle' }));
    }
  };

  const uploadToStorage = async (templateKey: string, file: File) => {
    setUploadStatus(prev => ({ ...prev, [templateKey]: 'uploading' }));

    try {
      // Upload directly to Supabase Storage
      const { error } = await supabase.storage
        .from('pdf-templates')
        .upload(`${templateKey}.pdf`, file, {
          upsert: true,
          contentType: 'application/pdf',
        });

      if (error) throw error;

      setUploadStatus(prev => ({ ...prev, [templateKey]: 'success' }));
      toast.success(`${templateKey}.pdf uploaded successfully!`);
    } catch (error) {
      console.error(`Error uploading ${templateKey}:`, error);
      setUploadStatus(prev => ({ ...prev, [templateKey]: 'error' }));
      toast.error(`Failed to upload ${templateKey}.pdf`);
    }
  };

  const uploadAll = async () => {
    const filesToUpload = Object.entries(files);
    
    if (filesToUpload.length === 0) {
      toast.error('Please select at least one PDF file to upload');
      return;
    }

    for (const [templateKey, file] of filesToUpload) {
      await uploadToStorage(templateKey, file);
    }

    toast.success('All files uploaded!');
  };

  const getStatusIcon = (templateKey: string) => {
    const status = uploadStatus[templateKey];
    if (status === 'uploading') return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    if (status === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (status === 'error') return <XCircle className="h-5 w-5 text-red-500" />;
    return null;
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Upload PDF Templates Directly</h1>
        <p className="text-muted-foreground mb-6">
          Select your PDF files from your computer and upload them directly to Supabase Storage.
        </p>

        <div className="space-y-4 mb-6">
          {TEMPLATE_TYPES.map((template) => (
            <div
              key={template.key}
              className="flex items-center gap-4 p-4 border rounded"
            >
              <div className="flex-1">
                <Label htmlFor={template.key} className="text-base font-semibold mb-2 block">
                  {template.label}
                </Label>
                <Input
                  id={template.key}
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={(e) => handleFileSelect(template.key, e.target.files?.[0] || null)}
                  className="cursor-pointer"
                />
                {files[template.key] && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {files[template.key].name} ({(files[template.key].size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {files[template.key] && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => uploadToStorage(template.key, files[template.key])}
                    disabled={uploadStatus[template.key] === 'uploading'}
                  >
                    {uploadStatus[template.key] === 'uploading' ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload
                      </>
                    )}
                  </Button>
                )}
                {getStatusIcon(template.key)}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <Button
            onClick={uploadAll}
            disabled={Object.keys(files).length === 0 || Object.values(uploadStatus).includes('uploading')}
            size="lg"
          >
            <Upload className="mr-2 h-5 w-5" />
            Upload All Selected Files
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setFiles({});
              setUploadStatus({});
            }}
          >
            Clear All
          </Button>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Select the PDF file for each template type from your computer</li>
            <li>Click "Upload" for each file individually, or "Upload All Selected Files" to upload all at once</li>
            <li>Once uploaded, the PDFs will be immediately available in the PDF generation system</li>
            <li>You can re-upload a file to replace an existing template</li>
          </ol>
        </div>
      </Card>
    </div>
  );
}
