import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2 } from "lucide-react";
import { DocumentItem } from "../RequiredDocumentsSection";

interface TwoColumnModernProps {
  title: string;
  documents: DocumentItem[];
  onChange: (id: string, checked: boolean) => void;
}

export function TwoColumnModern({
  title,
  documents,
  onChange,
}: TwoColumnModernProps) {
  const isComplete = documents.every(doc => doc.checked);

  const handleMasterToggle = () => {
    documents.forEach(doc => onChange(doc.id, !isComplete));
  };

  return (
    <div className={`p-6 rounded-2xl transition-all duration-700 ${
      isComplete 
        ? 'bg-gradient-to-br from-green-900/90 via-green-800/80 to-green-900/90 shadow-2xl shadow-green-900/50' 
        : 'bg-gradient-to-br from-slate-900/40 to-slate-800/30'
    }`}>
      {/* Master control bar */}
      <div className={`p-4 rounded-xl mb-6 transition-all ${
        isComplete 
          ? 'bg-green-700/40 border-2 border-green-500/60' 
          : 'bg-card/50 border-2 border-primary/20'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">{title}</h3>
          <button
            onClick={handleMasterToggle}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isComplete
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-primary text-primary-foreground hover:opacity-90'
            }`}
          >
            {isComplete && <CheckCircle2 className="w-4 h-4" />}
            Completed
          </button>
        </div>
      </div>

      {/* Documents grid */}
      <div className="grid grid-cols-2 gap-3">
        {documents.map((doc, index) => (
          <div
            key={doc.id}
            className={`group p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
              doc.checked
                ? 'bg-green-500/10 border-green-400/50 shadow-md'
                : 'bg-card/30 border-border/30 hover:border-primary/50 hover:shadow-lg'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
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
                className={`flex-1 text-sm font-medium cursor-pointer transition-all ${
                  doc.checked ? 'text-green-200' : ''
                }`}
              >
                {doc.label}
              </label>
              {doc.checked && (
                <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
