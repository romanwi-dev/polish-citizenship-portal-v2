import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DocumentGallery } from "@/components/documents/DocumentGallery";
import { DocumentViewer } from "@/components/workflows/DocumentViewer";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function DocumentGalleryPage() {
  const { caseId } = useParams<{ caseId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [previewDoc, setPreviewDoc] = useState<any>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  // Fetch documents
  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents-gallery", caseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("case_id", caseId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!caseId,
  });

  // Preview handler
  const handlePreview = async (doc: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-and-encode`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dropboxPath: doc.dropbox_path, returnUrl: true }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get preview URL');
      }

      const data = await response.json();
      setPreviewDoc({ ...doc, url: data.signedUrl });
      setIsViewerOpen(true);
    } catch (error: any) {
      toast({
        title: "Preview Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Download handler
  const handleDownload = async (doc: any) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      toast({ title: "Downloading...", description: "Please wait" });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-dropbox-file`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dropboxPath: doc.dropbox_path, caseId }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Download failed: ${response.status} - ${errorText}`);
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({ title: "Download complete", description: doc.name });
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Delete handler
  const handleDelete = async (docIds: string[]) => {
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .in("id", docIds);

      if (error) throw error;

      toast({ 
        title: "Deleted successfully", 
        description: `${docIds.length} document(s) removed` 
      });

      queryClient.invalidateQueries({ queryKey: ["documents-gallery", caseId] });
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Mark for translation
  const handleMarkTranslation = async (docIds: string[], needsTranslation: boolean) => {
    try {
      const { error } = await supabase
        .from("documents")
        .update({ 
          needs_translation: needsTranslation,
          translation_required: needsTranslation 
        })
        .in("id", docIds);

      if (error) throw error;

      toast({ 
        title: "Updated successfully", 
        description: `${docIds.length} document(s) marked for translation` 
      });

      queryClient.invalidateQueries({ queryKey: ["documents-gallery", caseId] });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Change category
  const handleChangeCategory = async (docIds: string[], category: string) => {
    try {
      const { error } = await supabase
        .from("documents")
        .update({ category })
        .in("id", docIds);

      if (error) throw error;

      toast({ 
        title: "Updated successfully", 
        description: `${docIds.length} document(s) category changed` 
      });

      queryClient.invalidateQueries({ queryKey: ["documents-gallery", caseId] });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">Document Gallery</h1>
        <p className="text-muted-foreground mt-2">
          Manage your documents with bulk operations and quick actions
        </p>
      </div>

      <DocumentGallery
        documents={documents}
        onPreview={handlePreview}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onMarkTranslation={handleMarkTranslation}
        onChangeCategory={handleChangeCategory}
      />

      {/* Document Viewer */}
      {previewDoc && (
        <DocumentViewer
          isOpen={isViewerOpen}
          onClose={() => {
            setIsViewerOpen(false);
            setPreviewDoc(null);
          }}
          documentUrl={previewDoc.url || ""}
          documentName={previewDoc.name || ""}
          documentType={previewDoc.file_extension || ""}
          ocrText={previewDoc.ocr_text || ""}
        />
      )}
    </div>
  );
}
