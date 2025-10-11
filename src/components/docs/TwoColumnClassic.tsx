import { Checkbox } from "@/components/ui/checkbox";
import { Check } from "lucide-react";
import { DocumentItem } from "../RequiredDocumentsSection";

interface TwoColumnClassicProps {
  title: string;
  documents: DocumentItem[];
  onChange: (id: string, checked: boolean) => void;
}

export function TwoColumnClassic({
  title,
  documents,
  onChange,
}: TwoColumnClassicProps) {
  const isComplete = documents.every(doc => doc.checked);

  const handleMasterToggle = () => {
    documents.forEach(doc => onChange(doc.id, !isComplete));
  };

  return (
    <div className={`p-8 rounded-xl border-2 transition-all duration-500 ${
      isComplete 
        ? 'bg-green-900/80 border-green-600' 
        : 'bg-card border-border'
    }`}>
      {/* Header with master checkbox */}
      <div className="mb-6 pb-4 border-b border-border/50">
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <div className="flex items-center gap-3">
          <Checkbox
            id="master-classic"
            checked={isComplete}
            onCheckedChange={handleMasterToggle}
            className="h-6 w-6"
          />
          <label
            htmlFor="master-classic"
            className="text-lg font-semibold cursor-pointer"
          >
            Completed
          </label>
          {isComplete && (
            <Check className="w-6 h-6 text-green-400 ml-2 animate-scale-in" />
          )}
        </div>
      </div>

      {/* Documents in 2 columns */}
      <div className="grid grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
              doc.checked
                ? 'bg-green-500/20 border-green-500/40'
                : 'bg-muted/30 border-muted-foreground/20 hover:border-primary/40'
            }`}
            onClick={() => onChange(doc.id, !doc.checked)}
          >
            <div className="flex items-center gap-3">
              <Checkbox
                id={doc.id}
                checked={doc.checked}
                onCheckedChange={(checked) => onChange(doc.id, checked as boolean)}
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
  );
}
