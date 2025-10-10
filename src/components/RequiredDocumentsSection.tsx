import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className={`text-base font-medium uppercase tracking-wide ${
          isComplete ? 'text-green-600 dark:text-green-400' : 'text-foreground'
        }`}>
          {title}
        </h3>
        {isComplete && (
          <div className="flex items-center gap-1.5 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
            <Check className="h-3 w-3" />
            Completed
          </div>
        )}
      </div>
      <div className="space-y-3">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center space-x-3">
            <Checkbox
              id={doc.id}
              checked={doc.checked}
              onCheckedChange={(checked) => onChange(doc.id, checked as boolean)}
              className="h-5 w-5"
            />
            <Label
              htmlFor={doc.id}
              className="text-sm font-normal cursor-pointer"
            >
              {doc.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
