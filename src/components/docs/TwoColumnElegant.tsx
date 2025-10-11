import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles } from "lucide-react";
import { DocumentItem } from "../RequiredDocumentsSection";

interface TwoColumnElegantProps {
  title: string;
  documents: DocumentItem[];
  onChange: (id: string, checked: boolean) => void;
}

export function TwoColumnElegant({
  title,
  documents,
  onChange,
}: TwoColumnElegantProps) {
  const isComplete = documents.every(doc => doc.checked);

  const handleMasterToggle = () => {
    documents.forEach(doc => onChange(doc.id, !isComplete));
  };

  return (
    <div className={`relative overflow-hidden p-8 rounded-3xl transition-all duration-700 ${
      isComplete 
        ? 'bg-gradient-to-br from-green-900/95 via-emerald-900/90 to-green-950/95 shadow-2xl border-2 border-green-500/50' 
        : 'bg-gradient-to-br from-card via-card/95 to-card/90 border-2 border-border/30'
    }`}>
      {/* Decorative background effect */}
      {isComplete && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)]" />
      )}

      <div className="relative z-10">
        {/* Elegant header */}
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            {title}
          </h3>
          <div className="flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <button
              onClick={handleMasterToggle}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-semibold transition-all ${
                isComplete
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/50 hover:shadow-xl hover:shadow-green-500/60'
                  : 'bg-primary/10 text-primary border border-primary/30 hover:bg-primary/20'
              }`}
            >
              {isComplete && <Sparkles className="w-4 h-4" />}
              Completed
            </button>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        </div>

        {/* Elegant 2-column grid */}
        <div className="grid grid-cols-2 gap-5">
          {documents.map((doc, index) => (
            <div
              key={doc.id}
              className={`group relative p-5 rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                doc.checked
                  ? 'bg-green-500/10 border-green-400/60 shadow-lg'
                  : 'bg-card/40 border-border/40 hover:border-primary/50 hover:shadow-md'
              }`}
              style={{ animationDelay: `${index * 60}ms` }}
              onClick={() => onChange(doc.id, !doc.checked)}
            >
              {/* Shimmer effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
              
              <div className="relative flex items-center gap-4">
                <Checkbox
                  id={doc.id}
                  checked={doc.checked}
                  className="h-5 w-5"
                  onClick={(e) => e.stopPropagation()}
                />
                <label
                  htmlFor={doc.id}
                  className="flex-1 text-base font-medium cursor-pointer"
                >
                  {doc.label}
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
