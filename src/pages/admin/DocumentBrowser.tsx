import { useState } from "react";
import { useParams } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { DocumentBrowserAdmin } from "@/components/documents/DocumentBrowserAdmin";
import { ConflictResolutionModal } from "@/components/documents/ConflictResolutionModal";
import { BulkDropboxScanner } from "@/components/documents/BulkDropboxScanner";
import { useOCRConflictDetection } from "@/hooks/useOCRConflictDetection";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ScanLine, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const DocumentBrowser = () => {
  const { id } = useParams();
  const [selectedConflict, setSelectedConflict] = useState<any>(null);
  const { conflicts, conflictCount, resolveConflict, isResolving } = useOCRConflictDetection(id);

  // Fetch case details for Dropbox path
  const { data: caseData } = useQuery({
    queryKey: ['case-dropbox', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('cases')
        .select('dropbox_path')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id
  });

  const handleResolve = (conflictId: string, resolution: 'ocr' | 'manual' | 'ignore', notes?: string) => {
    resolveConflict({ conflictId, resolution, notes });
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Document Browser & OCR Management</h1>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              if (caseData?.dropbox_path) {
                window.open(`https://www.dropbox.com/home${caseData.dropbox_path}`, '_blank');
              } else {
                toast({ title: 'No Dropbox path configured', variant: 'destructive' });
              }
            }}
          >
            <FolderOpen className="h-4 w-4" />
            Open Dropbox Folder
          </Button>
        </div>

        {conflictCount > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{conflictCount} OCR conflict{conflictCount !== 1 ? 's' : ''} need{conflictCount === 1 ? 's' : ''} review</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => conflicts[0] && setSelectedConflict(conflicts[0])}
              >
                Review Conflicts
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="browser" className="w-full">
          <TabsList className="glass-card">
            <TabsTrigger value="browser">Document Browser</TabsTrigger>
            <TabsTrigger value="bulk-scan">
              <ScanLine className="h-4 w-4 mr-2" />
              Bulk OCR Scanner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browser" className="space-y-6">
            <DocumentBrowserAdmin caseId={id} />
          </TabsContent>

          <TabsContent value="bulk-scan">
            <BulkDropboxScanner />
          </TabsContent>
        </Tabs>

        <ConflictResolutionModal
          conflict={selectedConflict}
          open={!!selectedConflict}
          onOpenChange={(open) => !open && setSelectedConflict(null)}
          onResolve={handleResolve}
          isResolving={isResolving}
        />
      </div>
    </AdminLayout>
  );
};

export default DocumentBrowser;
