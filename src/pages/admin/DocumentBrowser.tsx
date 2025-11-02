import { AdminLayout } from "@/components/AdminLayout";
import { DocumentBrowserAdmin } from "@/components/documents/DocumentBrowserAdmin";
import { useOCRConflictDetection } from "@/hooks/useOCRConflictDetection";
import { ConflictResolutionModal } from "@/components/documents/ConflictResolutionModal";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, FolderOpen } from "lucide-react";
import { useParams } from "react-router-dom";

const DocumentBrowser = () => {
  const { id: caseId } = useParams();
  const [selectedConflict, setSelectedConflict] = useState<any>(null);
  const { conflicts, conflictCount, resolveConflict, isResolving } = useOCRConflictDetection(caseId);

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FolderOpen className="w-8 h-8" />
            Document Browser
          </h1>
          <p className="text-muted-foreground mt-1">
            Browse, search, and manage case documents
          </p>
        </div>

        {/* Conflict Alert */}
        {conflictCount > 0 && (
          <div className="glass-card p-4 border-orange-500/50 bg-orange-500/5 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              <div className="flex-1">
                <p className="font-semibold text-orange-700">Data Conflicts Detected</p>
                <p className="text-sm text-muted-foreground">
                  {conflictCount} conflict{conflictCount !== 1 ? 's' : ''} found between OCR and manual data
                </p>
              </div>
              <Badge variant="outline" className="text-orange-700 border-orange-500/50">
                {conflictCount} Conflicts
              </Badge>
            </div>

            {/* Conflict list */}
            <div className="mt-4 space-y-2">
              {conflicts.slice(0, 5).map((conflict: any) => (
                <div
                  key={conflict.id}
                  onClick={() => setSelectedConflict(conflict)}
                  className="p-3 bg-background/50 rounded-lg cursor-pointer hover:bg-background/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{conflict.field_name}</p>
                      <p className="text-xs text-muted-foreground">
                        OCR: "{conflict.ocr_value}" vs Manual: "{conflict.manual_value}"
                      </p>
                    </div>
                    {conflict.ocr_confidence && (
                      <Badge variant="outline" className="text-xs">
                        {conflict.ocr_confidence}% confident
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {conflictCount > 5 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  +{conflictCount - 5} more conflicts
                </p>
              )}
            </div>
          </div>
        )}

        {/* Document Browser */}
        {caseId && <DocumentBrowserAdmin caseId={caseId} />}

        {/* Conflict Resolution Modal */}
        <ConflictResolutionModal
          open={!!selectedConflict}
          onOpenChange={(open) => !open && setSelectedConflict(null)}
          conflict={selectedConflict}
          onResolve={(id, res, notes) => resolveConflict({ conflictId: id, resolution: res, notes })}
          isResolving={isResolving}
        />
      </div>
    </AdminLayout>
  );
};

export default DocumentBrowser;
