import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Upload, Check, AlertCircle, Cloud, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function UploadPDFTemplates() {
  const [uploading, setUploading] = useState(false);
  const [fetchingFromDropbox, setFetchingFromDropbox] = useState(false);
  const [status, setStatus] = useState<Record<string, 'pending' | 'success' | 'error'>>({});

  const templates = [
    { filename: 'poa-adult.pdf', label: 'POA Adult', type: 'poa-adult' },
    { filename: 'poa-minor.pdf', label: 'POA Minor', type: 'poa-minor' },
    { filename: 'poa-spouses.pdf', label: 'POA Spouses', type: 'poa-spouses' },
    { filename: 'poa-combined.pdf', label: 'POA Combined (3 pages)', type: 'poa-combined' },
    { filename: 'family-tree.pdf', label: 'Family Tree', type: 'family-tree' },
    { filename: 'citizenship.pdf', label: 'Citizenship Application', type: 'citizenship' },
    { filename: 'transcription.pdf', label: 'Transcription', type: 'transcription' },
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

  const deleteTemplate = async (filename: string) => {
    try {
      const { error } = await supabase.storage
        .from('pdf-templates')
        .remove([filename]);

      if (error) throw error;
      
      setStatus(prev => ({ ...prev, [filename]: 'success' }));
      toast.success(`Deleted ${filename}`);
      return true;
    } catch (error: any) {
      console.error(`Error deleting ${filename}:`, error);
      setStatus(prev => ({ ...prev, [filename]: 'error' }));
      toast.error(`Failed to delete ${filename}`);
      throw error;
    }
  };

  const fetchFromDropbox = async (templateType: string) => {
    try {
      const { data, error } = await supabase.functions.invoke(
        'fetch-templates-from-dropbox',
        {
          body: { templateType }
        }
      );

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      setStatus(prev => ({ ...prev, [templateType]: 'success' }));
      return true;
    } catch (error: any) {
      console.error(`Error fetching ${templateType} from Dropbox:`, error);
      setStatus(prev => ({ ...prev, [templateType]: 'error' }));
      throw error;
    }
  };

  const handleFetchAllFromDropbox = async () => {
    setFetchingFromDropbox(true);
    const loadingToast = toast.loading('Fetching PDF templates from Dropbox...');
    
    try {
      setStatus({});
      
      for (const template of templates) {
        await fetchFromDropbox(template.type);
      }
      
      toast.dismiss(loadingToast);
      toast.success('All PDF templates fetched from Dropbox!');
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(`Dropbox fetch failed: ${error.message}`);
    } finally {
      setFetchingFromDropbox(false);
    }
  };

  const handleUploadAll = async () => {
    setUploading(true);
    const loadingToast = toast.loading('Uploading PDF templates to storage...');
    
    try {
      setStatus({});
      
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
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="bg-background/95 backdrop-blur-sm border-primary/20">
          <CardHeader>
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Upload PDF Templates
            </CardTitle>
            <CardDescription className="text-lg">
              Upload templates from local files or sync from Dropbox
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="local" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="local">Local Upload</TabsTrigger>
                <TabsTrigger value="dropbox">Dropbox Sync</TabsTrigger>
              </TabsList>
              
              <TabsContent value="local" className="space-y-6 mt-6">
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
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteTemplate(template.filename)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
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
                  </ul>
                </div>
              </TabsContent>

              <TabsContent value="dropbox" className="space-y-6 mt-6">
                <div className="space-y-4">
                  {templates.map(template => (
                    <div 
                      key={template.filename}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {status[template.type] === 'success' && (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
                        {status[template.type] === 'error' && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        {!status[template.type] && (
                          <div className="h-5 w-5" />
                        )}
                        <div>
                          <p className="font-medium">{template.label}</p>
                          <p className="text-sm text-muted-foreground">{template.filename}</p>
                        </div>
                      </div>
                      <div className="text-sm">
                        {status[template.type] === 'success' && (
                          <span className="text-green-500">Synced</span>
                        )}
                        {status[template.type] === 'error' && (
                          <span className="text-red-500">Failed</span>
                        )}
                        {!status[template.type] && (
                          <span className="text-muted-foreground">Ready</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={handleFetchAllFromDropbox}
                  disabled={fetchingFromDropbox}
                  size="lg"
                  className="w-full"
                >
                  <Cloud className="h-5 w-5 mr-2" />
                  {fetchingFromDropbox ? 'Syncing from Dropbox...' : 'Sync All from Dropbox'}
                </Button>

                <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <h3 className="font-semibold text-green-400 mb-2">Dropbox Integration:</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Fetches latest templates directly from Dropbox folders</li>
                    <li>• Source: /# POA and /# WORK directories</li>
                    <li>• Automatically uploads to pdf-templates storage bucket</li>
                    <li>• No need to manually download and re-upload files</li>
                    <li>• Always stays in sync with your master files</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
