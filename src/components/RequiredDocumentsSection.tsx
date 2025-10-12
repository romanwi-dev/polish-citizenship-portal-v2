import { Checkbox } from "@/components/ui/checkbox";

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
  const someChecked = documents.some(doc => doc.checked) && !isComplete;
  
  // Toggle all documents
  const handleMasterToggle = (checked: boolean) => {
    documents.forEach(doc => {
      onChange(doc.id, checked as boolean);
    });
  };
  
  // Color scheme backgrounds
  const getBackgroundColor = () => {
    if (isComplete) return 'bg-green-900/40 border-green-700/50';
    
    switch (colorScheme) {
      case 'slate':
        return 'bg-slate-800/30 border-slate-700/50';
      case 'blue':
        return 'bg-blue-950/30 border-blue-800/50';
      case 'amber':
        return 'bg-amber-900/30 border-amber-800/50';
      case 'green':
        return 'bg-green-900/30 border-green-800/50';
      case 'purple':
        return 'bg-purple-900/30 border-purple-800/50';
      default:
        return 'bg-blue-950/30 border-blue-800/50';
    }
  };
  
  return (
    <div className={`p-6 border-2 rounded-lg transition-all ${getBackgroundColor()}`}>
      <div className="flex items-center space-x-3 mb-6 p-4 bg-blue-950/40 border-2 border-blue-800/50 rounded-none">
        <Checkbox
          id={`${title}-master`}
          checked={isComplete}
          onCheckedChange={handleMasterToggle}
          className="h-5 w-5 shrink-0"
          aria-label="Toggle all documents"
        />
        <label
          htmlFor={`${title}-master`}
          className="text-xs font-light tracking-[0.2em] cursor-pointer text-foreground/90"
        >
          {title}
        </label>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div 
            key={doc.id} 
            className="flex items-center space-x-3 p-4 bg-[#0a1929] border-2 border-blue-900/70 rounded-none hover:border-blue-700/70 transition-all"
          >
            <Checkbox
              id={doc.id}
              checked={doc.checked}
              onCheckedChange={(checked) => onChange(doc.id, checked as boolean)}
              className="h-5 w-5 shrink-0"
            />
            <label
              htmlFor={doc.id}
              className="text-xs font-light tracking-[0.2em] cursor-pointer text-foreground/90"
            >
              {doc.label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
