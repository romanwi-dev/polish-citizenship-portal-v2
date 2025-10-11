import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { DocumentItem } from "../RequiredDocumentsSection";

interface TwoColumnCompactProps {
  title: string;
  documents: DocumentItem[];
  onChange: (id: string, checked: boolean) => void;
}

export function TwoColumnCompact({
  title,
  documents,
  onChange,
}: TwoColumnCompactProps) {
  const isComplete = documents.every(doc => doc.checked);
  const completedCount = documents.filter(d => d.checked).length;

  const handleMasterToggle = () => {
    documents.forEach(doc => onChange(doc.id, !isComplete));
  };

  return (
    <div className={`p-5 rounded-lg border-2 transition-all duration-500 ${
      isComplete 
        ? 'bg-green-950/90 border-green-600/80' 
        : 'bg-card/80 border-border/60'
    }`}>
      {/* Compact header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold">{title}</h3>
          <Badge variant={isComplete ? "default" : "secondary"} className="text-xs">
            {completedCount}/{documents.length}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="master-compact"
            checked={isComplete}
            onCheckedChange={handleMasterToggle}
            className="h-5 w-5"
          />
          <label
            htmlFor="master-compact"
            className="text-sm font-semibold cursor-pointer"
          >
            Completed
          </label>
        </div>
      </div>

      {/* Compact 2-column grid */}
      <div className="grid grid-cols-2 gap-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`flex items-center gap-2 p-2.5 rounded border transition-all cursor-pointer ${
              doc.checked
                ? 'bg-green-500/15 border-green-500/50'
                : 'bg-muted/20 border-muted-foreground/10 hover:border-primary/30'
            }`}
            onClick={() => onChange(doc.id, !doc.checked)}
          >
            <Checkbox
              id={doc.id}
              checked={doc.checked}
              className="h-4 w-4"
              onClick={(e) => e.stopPropagation()}
            />
            <label
              htmlFor={doc.id}
              className={`text-xs font-medium cursor-pointer flex-1 ${
                doc.checked ? 'line-through opacity-75' : ''
              }`}
            >
              {doc.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
