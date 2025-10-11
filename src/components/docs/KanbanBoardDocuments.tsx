import { Checkbox } from "@/components/ui/checkbox";
import { FileX, FileCheck } from "lucide-react";
import { DocumentItem } from "../RequiredDocumentsSection";

interface KanbanBoardDocumentsProps {
  title: string;
  documents: DocumentItem[];
  onChange: (id: string, checked: boolean) => void;
}

export function KanbanBoardDocuments({
  title,
  documents,
  onChange,
}: KanbanBoardDocumentsProps) {
  const pendingDocs = documents.filter(doc => !doc.checked);
  const completedDocs = documents.filter(doc => doc.checked);

  const handleMasterToggle = () => {
    const allChecked = completedDocs.length === documents.length;
    documents.forEach(doc => onChange(doc.id, !allChecked));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/10 to-green-500/10 rounded-lg border border-amber-500/20">
        <h3 className="text-xl font-bold tracking-tight">{title}</h3>
        <button
          onClick={handleMasterToggle}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          {completedDocs.length === documents.length ? 'Reset All' : 'Complete All'}
        </button>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-2 gap-4">
        {/* Pending column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-amber-500/10 border-2 border-amber-500/30 rounded-lg">
            <FileX className="w-5 h-5 text-amber-600" />
            <h4 className="font-semibold text-amber-700 dark:text-amber-400">
              Pending ({pendingDocs.length})
            </h4>
          </div>
          <div className="space-y-2 min-h-[200px]">
            {pendingDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-3 bg-card border-2 border-amber-500/20 rounded-lg hover:border-amber-500/40 transition-all cursor-pointer group animate-fade-in"
                onClick={() => onChange(doc.id, true)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={doc.id}
                    checked={false}
                    className="h-4 w-4"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm font-medium flex-1">{doc.label}</span>
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to complete →
                  </span>
                </div>
              </div>
            ))}
            {pendingDocs.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No pending documents
              </div>
            )}
          </div>
        </div>

        {/* Completed column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 bg-green-500/10 border-2 border-green-500/30 rounded-lg">
            <FileCheck className="w-5 h-5 text-green-600" />
            <h4 className="font-semibold text-green-700 dark:text-green-400">
              Completed ({completedDocs.length})
            </h4>
          </div>
          <div className="space-y-2 min-h-[200px]">
            {completedDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-3 bg-green-500/5 border-2 border-green-500/30 rounded-lg hover:border-green-500/50 transition-all cursor-pointer group animate-fade-in"
                onClick={() => onChange(doc.id, false)}
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    id={doc.id}
                    checked={true}
                    className="h-4 w-4"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-sm font-medium flex-1 line-through opacity-75">
                    {doc.label}
                  </span>
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    ← Click to undo
                  </span>
                </div>
              </div>
            ))}
            {completedDocs.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                No completed documents yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
