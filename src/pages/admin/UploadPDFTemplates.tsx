import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Check, AlertCircle } from "lucide-react";

export default function UploadPDFTemplates() {
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<Record<string, 'pending' | 'success' | 'error'>>({});

  const templates = [
    { filename: 'poa-adult.pdf', label: 'POA Adult' },
    { filename: 'poa-minor.pdf', label: 'POA Minor' },
    { filename: 'poa-spouses.pdf', label: 'POA Spouses' },
    { filename: 'family-tree.pdf', label: 'Family Tree' },
    { filename: 'citizenship.pdf', label: 'Citizenship Application' },
    { filename: 'transcription.pdf', label: 'Transcription' },
  ];

  const uploadTemplate = async (filename: string) => {
    try {
      // Fetch the PDF from public folder
      const response = await fetch(`/pdf-templates/${filename}`);
      if (!response.ok) throw new Error(`Failed to fetch ${filename}`);
      
      const blob = await response.blob();
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('pdf-templates')
        .upload(filename, blob, {
          upsert: true,
          contentType: 'application/pdf',
        });

      if (uploadError) throw uploadError;
      
      setStatus(prev => ({ ...prev, [filename]: 'success' }));
      return true;
    } catch (error: any) {
      console.error(`Error uploading ${filename}:`, error);
      setStatus(prev => ({ ...prev, [filename]: 'error' }));
      throw error;
    }
  };

  const handleUploadAll = async () => {
    setUploading(true);
    const loadingToast = toast.loading('Uploading PDF templates to storage...');
    
    try {
      // Reset status
      setStatus({});
      
      // Upload all templates
      for (const template of templates) {
        await uploadTemplate(template.filename);
      }
      
      toast.dismiss(loadingToast);
      toast.success('All PDF templates uploaded successfully!');
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-slate-900 to-black p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-background/95 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Upload PDF Templates
            </CardTitle>
            <CardDescription className="text-lg">
              Upload the correct POA templates to Supabase Storage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {templates.map(template => (
                <div 
                  key={template.filename}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {status[template.filename] === 'success' && (
                      <Check className="h-5 w-5 text-green-500" />
                    )}
                    {status[template.filename] === 'error' && (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                    {!status[template.filename] && (
                      <div className="h-5 w-5" />
                    )}
                    <div>
                      <p className="font-medium">{template.label}</p>
                      <p className="text-sm text-muted-foreground">{template.filename}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    {status[template.filename] === 'success' && (
                      <span className="text-green-500">Uploaded</span>
                    )}
                    {status[template.filename] === 'error' && (
                      <span className="text-red-500">Failed</span>
                    )}
                    {!status[template.filename] && (
                      <span className="text-muted-foreground">Ready</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={handleUploadAll}
              disabled={uploading}
              size="lg"
              className="w-full"
            >
              <Upload className="h-5 w-5 mr-2" />
              {uploading ? 'Uploading...' : 'Upload All Templates to Storage'}
            </Button>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h3 className="font-semibold text-blue-400 mb-2">What this does:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Loads ALL PDF templates from the public folder</li>
                <li>• Uploads them to the pdf-templates storage bucket</li>
                <li>• Replaces the old blank templates with full content</li>
                <li>• PDFs will generate with all Polish text and formatting</li>
                <li>• Includes: POA (Adult/Minor/Spouses), Family Tree, Citizenship, Transcription</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
