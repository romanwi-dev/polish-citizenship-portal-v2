import { Checkbox } from "@/components/ui/checkbox";
import { Check } from "lucide-react";

export interface DocumentItem {
  id: string;
  label: string;
  checked: boolean;
}

interface RequiredDocumentsSectionProps {
  title: string;
  documents: DocumentItem[];
  onChange: (id: string, checked: boolean) => void;
  colorScheme?: "slate" | "blue" | "amber" | "green" | "purple";
}

export function RequiredDocumentsSection({
  title,
  documents,
  onChange,
  colorScheme = "slate",
}: RequiredDocumentsSectionProps) {
  const isComplete = documents.every(doc => doc.checked);
  
  return (
    <div className={`p-6 border-2 rounded-lg transition-all ${
      isComplete 
        ? 'bg-green-900/40 border-green-700/50' 
        : 'bg-blue-950/30 border-blue-800/50'
    }`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xs font-light uppercase tracking-[0.2em] text-foreground/90">
          {title}
        </h3>
        {isComplete && (
          <div className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
            <Check className="h-3 w-3" />
            Completed
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div 
            key={doc.id} 
            className="flex items-center space-x-3 p-4 bg-blue-950/40 border-2 border-blue-800/50 rounded-none hover:border-blue-700/70 transition-all"
          >
            <Checkbox
              id={doc.id}
              checked={doc.checked}
              onCheckedChange={(checked) => onChange(doc.id, checked as boolean)}
              className="h-5 w-5 shrink-0"
            />
            <label
              htmlFor={doc.id}
              className="text-xs font-light uppercase tracking-[0.2em] cursor-pointer text-foreground/90"
            >
              {doc.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
