import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Check } from "lucide-react";
import { DocumentItem } from "../RequiredDocumentsSection";

interface MinimalistCardsDocumentsProps {
  title: string;
  documents: DocumentItem[];
  onChange: (id: string, checked: boolean) => void;
}

export function MinimalistCardsDocuments({
  title,
  documents,
  onChange,
}: MinimalistCardsDocumentsProps) {
  const completedCount = documents.filter(doc => doc.checked).length;
  const totalCount = documents.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const handleMasterToggle = () => {
    const allChecked = completedCount === totalCount;
    documents.forEach(doc => onChange(doc.id, !allChecked));
  };

  return (
    <div className="space-y-6">
      {/* Header with circular progress */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border border-primary/20">
        <div className="flex-1">
          <h3 className="text-2xl font-semibold tracking-tight mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground">
            {completedCount} of {totalCount} documents collected
          </p>
          <Progress value={progressPercentage} className="mt-3 h-2" />
        </div>
        <div className="relative w-24 h-24 ml-6">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-primary/10"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 40}`}
              strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercentage / 100)}`}
              className="text-primary transition-all duration-1000 ease-out"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold">{Math.round(progressPercentage)}%</span>
          </div>
        </div>
      </div>

      {/* Master toggle */}
      <button
        onClick={handleMasterToggle}
        className="w-full p-4 bg-card hover:bg-accent rounded-xl border-2 border-dashed border-primary/30 hover:border-primary/50 transition-all duration-200 flex items-center gap-3"
      >
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          completedCount === totalCount 
            ? 'bg-primary border-primary text-primary-foreground' 
            : 'border-primary/30'
        }`}>
          {completedCount === totalCount && <Check className="w-4 h-4" />}
        </div>
        <span className="font-medium">
          {completedCount === totalCount ? 'Uncheck All' : 'Check All'}
        </span>
      </button>

      {/* Document cards */}
      <div className="grid gap-3">
        {documents.map((doc, index) => (
          <div
            key={doc.id}
            className={`group p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer ${
              doc.checked
                ? 'bg-primary/5 border-primary/40 shadow-md'
                : 'bg-card border-border/50 hover:border-primary/30'
            }`}
            style={{ animationDelay: `${index * 50}ms` }}
            onClick={() => onChange(doc.id, !doc.checked)}
          >
            <div className="flex items-center gap-4">
              <Checkbox
                id={doc.id}
                checked={doc.checked}
                onCheckedChange={(checked) => onChange(doc.id, checked as boolean)}
                className="h-5 w-5"
                onClick={(e) => e.stopPropagation()}
              />
              <label
                htmlFor={doc.id}
                className="flex-1 text-base font-medium cursor-pointer select-none"
              >
                {doc.label}
              </label>
              {doc.checked && (
                <Check className="w-5 h-5 text-primary animate-scale-in" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
