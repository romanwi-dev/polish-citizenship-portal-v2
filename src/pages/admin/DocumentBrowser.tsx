import { useState } from "react";
import { useParams } from "react-router-dom";
import { AdminLayout } from "@/components/AdminLayout";
import { DocumentBrowserAdmin } from "@/components/documents/DocumentBrowserAdmin";
import { ConflictResolutionModal } from "@/components/documents/ConflictResolutionModal";
import { BulkDropboxScanner } from "@/components/documents/BulkDropboxScanner";
import { useOCRConflictDetection } from "@/hooks/useOCRConflictDetection";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DocumentBrowser = () => {
  const { id } = useParams();
  const [selectedConflict, setSelectedConflict] = useState<any>(null);
  const { conflicts, conflictCount, resolveConflict, isResolving } = useOCRConflictDetection(id);

  const handleResolve = (conflictId: string, resolution: 'ocr' | 'manual' | 'ignore', notes?: string) => {
    resolveConflict({ conflictId, resolution, notes });
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Document Browser & OCR Management</h1>
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
