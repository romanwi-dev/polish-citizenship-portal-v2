import { Checkbox } from "@/components/ui/checkbox";
import { Award } from "lucide-react";
import { DocumentItem } from "../RequiredDocumentsSection";

interface TwoColumnBoldProps {
  title: string;
  documents: DocumentItem[];
  onChange: (id: string, checked: boolean) => void;
}

export function TwoColumnBold({
  title,
  documents,
  onChange,
}: TwoColumnBoldProps) {
  const isComplete = documents.every(doc => doc.checked);
  const percentage = Math.round((documents.filter(d => d.checked).length / documents.length) * 100);

  const handleMasterToggle = () => {
    documents.forEach(doc => onChange(doc.id, !isComplete));
  };

  return (
    <div className={`p-7 rounded-xl transition-all duration-700 shadow-xl ${
      isComplete 
        ? 'bg-green-900/85 border-4 border-green-500' 
        : 'bg-card border-4 border-primary/30'
    }`}>
      {/* Bold header with progress */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-1">{title}</h3>
            <div className="text-sm font-bold text-muted-foreground">
              Progress: {percentage}%
            </div>
          </div>
          {isComplete && (
            <Award className="w-12 h-12 text-green-400 animate-pulse" />
          )}
        </div>

        {/* Bold master checkbox */}
        <div
          onClick={handleMasterToggle}
          className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all ${
            isComplete
              ? 'bg-green-700/40 border-2 border-green-400'
              : 'bg-primary/10 border-2 border-primary/40 hover:bg-primary/15'
          }`}
        >
          <Checkbox
            id="master-bold"
            checked={isComplete}
            className="h-6 w-6"
          />
          <span className="text-lg font-black uppercase tracking-wide">
            Completed
          </span>
        </div>
      </div>

      {/* Bold 2-column grid */}
      <div className="grid grid-cols-2 gap-4">
        {documents.map((doc, index) => (
          <div
            key={doc.id}
            className={`p-4 rounded-lg border-3 transition-all cursor-pointer transform hover:scale-105 ${
              doc.checked
                ? 'bg-green-600/20 border-2 border-green-400/70 shadow-md'
                : 'bg-muted/40 border-2 border-muted-foreground/30 hover:border-primary/60'
            }`}
            style={{ animationDelay: `${index * 40}ms` }}
            onClick={() => onChange(doc.id, !doc.checked)}
          >
            <div className="flex items-center gap-3">
              <Checkbox
                id={doc.id}
                checked={doc.checked}
                className="h-5 w-5"
                onClick={(e) => e.stopPropagation()}
              />
              <label
                htmlFor={doc.id}
                className="flex-1 text-sm font-bold uppercase tracking-tight cursor-pointer"
              >
                {doc.label}
              </label>
              {doc.checked && (
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar at bottom */}
      <div className="mt-6 h-2 bg-muted/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-700"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
