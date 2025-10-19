import { Checkbox } from "@/components/ui/checkbox";
import { FileCheck, FileX, Files } from "lucide-react";
import { DocumentItem } from "../RequiredDocumentsSection";

interface GridMatrixDocumentsProps {
  title: string;
  documents: DocumentItem[];
  onChange: (id: string, checked: boolean) => void;
}

export function GridMatrixDocuments({
  title,
  documents,
  onChange,
}: GridMatrixDocumentsProps) {
  const completedCount = documents.filter(doc => doc.checked).length;
  const percentage = Math.round((completedCount / documents.length) * 100);

  const handleMasterToggle = () => {
    const allChecked = completedCount === documents.length;
    documents.forEach(doc => onChange(doc.id, !allChecked));
  };

  return (
    <div className="space-y-4">
      {/* Compact header with stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <Files className="w-5 h-5 text-blue-500 mb-1" />
          <div className="text-2xl font-bold">{documents.length}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <FileCheck className="w-5 h-5 text-green-500 mb-1" />
          <div className="text-2xl font-bold">{completedCount}</div>
          <div className="text-xs text-muted-foreground">Complete</div>
        </div>
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <FileX className="w-5 h-5 text-amber-500 mb-1" />
          <div className="text-2xl font-bold">{documents.length - completedCount}</div>
          <div className="text-xs text-muted-foreground">Pending</div>
        </div>
      </div>

      {/* Title and toggle */}
      <div className="flex items-center justify-between p-3 bg-card border-2 border-border rounded-lg">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">{percentage}%</span>
          <button
            onClick={handleMasterToggle}
            className="px-3 py-1 bg-primary text-primary-foreground rounded text-xs font-medium hover:opacity-90"
          >
            {completedCount === documents.length ? 'Clear' : 'All'}
          </button>
        </div>
      </div>

      {/* Dense grid of documents */}
      <div className="grid grid-cols-3 gap-2">
        {documents.map((doc, index) => (
          <div
            key={doc.id}
            className={`group relative p-3 border-2 rounded-lg transition-all duration-200 cursor-pointer hover:scale-105 ${
              doc.checked
                ? 'bg-green-500/10 border-green-500/40 shadow-sm'
                : 'bg-card border-border/50 hover:border-primary/40'
            }`}
            style={{ animationDelay: `${index * 30}ms` }}
            onClick={() => onChange(doc.id, !doc.checked)}
          >
            {/* Status icon */}
            <div className="absolute -top-2 -right-2">
              {doc.checked ? (
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                  <FileCheck className="w-3.5 h-3.5 text-white" />
                </div>
              ) : (
                <div className="w-6 h-6 bg-muted border-2 border-border rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FileX className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id={doc.id}
                checked={doc.checked}
                onCheckedChange={(checked) => onChange(doc.id, checked as boolean)}
                className="h-4 w-4 mt-0.5 shrink-0"
                onClick={(e) => e.stopPropagation()}
              />
              <label
                htmlFor={doc.id}
                className={`text-xs font-medium leading-tight cursor-pointer select-none ${
                  doc.checked ? 'line-through opacity-60' : ''
                }`}
              >
                {doc.label}
              </label>
            </div>

            {/* Index number */}
            <div className="absolute bottom-1 right-2 text-xs font-mono text-muted-foreground/30">
              #{index + 1}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
