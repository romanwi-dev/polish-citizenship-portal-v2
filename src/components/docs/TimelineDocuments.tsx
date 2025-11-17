import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Circle } from "lucide-react";
import { DocumentItem } from "../RequiredDocumentsSection";
import { getStaggerDelay } from "@/config/animations";

interface TimelineDocumentsProps {
  title: string;
  documents: DocumentItem[];
  onChange: (id: string, checked: boolean) => void;
}

export function TimelineDocuments({
  title,
  documents,
  onChange,
}: TimelineDocumentsProps) {
  const completedCount = documents.filter(doc => doc.checked).length;

  const handleMasterToggle = () => {
    const allChecked = completedCount === documents.length;
    documents.forEach(doc => onChange(doc.id, !allChecked));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-green-500/10 rounded-xl border-2 border-purple-500/20">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-2xl font-bold tracking-tight">{title}</h3>
          <button
            onClick={handleMasterToggle}
            className="px-4 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-full text-sm font-medium transition-colors"
          >
            {completedCount === documents.length ? 'Clear Progress' : 'Complete All'}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 transition-all duration-700 ease-out"
              style={{ width: `${(completedCount / documents.length) * 100}%` }}
            />
          </div>
          <span className="text-sm font-semibold min-w-[80px] text-right">
            {completedCount}/{documents.length}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-8">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-green-500 opacity-20" />
        <div
          className="absolute left-4 top-0 w-0.5 bg-gradient-to-b from-purple-500 via-blue-500 to-green-500 transition-all duration-700 ease-out"
          style={{ height: `${(completedCount / documents.length) * 100}%` }}
        />

        {/* Timeline items */}
        <div className="space-y-4">
          {documents.map((doc, index) => {
            const isCompleted = doc.checked;
            const isPrevCompleted = index === 0 || documents[index - 1].checked;
            
            return (
              <div
                key={doc.id}
                className="relative animate-fade-in"
                style={{ animationDelay: `${getStaggerDelay(index)}ms` }}
              >
                {/* Timeline dot */}
                <div className="absolute -left-7 top-1/2 -translate-y-1/2">
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-green-500 animate-scale-in" />
                  ) : (
                    <Circle className={`w-6 h-6 ${isPrevCompleted ? 'text-primary' : 'text-muted-foreground/30'}`} />
                  )}
                </div>

                {/* Content card */}
                <div
                  className={`p-4 rounded-lg border-2 transition-all duration-300 cursor-pointer ${
                    isCompleted
                      ? 'bg-green-500/5 border-green-500/30 shadow-sm'
                      : isPrevCompleted
                      ? 'bg-card border-primary/20 hover:border-primary/40 hover:shadow-md'
                      : 'bg-muted/30 border-muted-foreground/10'
                  }`}
                  onClick={() => onChange(doc.id, !doc.checked)}
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={doc.id}
                      checked={isCompleted}
                      onCheckedChange={(checked) => onChange(doc.id, checked as boolean)}
                      className="h-5 w-5"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={doc.id}
                        className={`text-base font-medium cursor-pointer ${
                          isCompleted ? 'line-through opacity-60' : ''
                        }`}
                      >
                        {doc.label}
                      </label>
                      <p className="text-sm md:text-xs text-muted-foreground mt-1">
                        Step {index + 1} of {documents.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
