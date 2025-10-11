import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileCheck, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentItem {
  id: string;
  label: string;
  checked: boolean;
}

interface FlippableCardsMidnightProps {
  title: string;
  documents: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}

export const FlippableCardsMidnight = ({ title, documents, onChange }: FlippableCardsMidnightProps) => {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleToggle = (id: string, checked: boolean) => {
    const updated = documents.map(doc =>
      doc.id === id ? { ...doc, checked } : doc
    );
    onChange(updated);
  };

  const allChecked = documents.every(doc => doc.checked);

  return (
    <div className={cn(
      "p-8 rounded-xl transition-all duration-700 relative",
      allChecked 
        ? "bg-gradient-to-br from-green-950/60 to-green-900/40" 
        : "bg-gradient-to-br from-slate-950/60 to-blue-950/40"
    )}>
      {/* Radial glow effect */}
      <div className={cn(
        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl transition-all duration-700",
        allChecked ? "bg-green-500/10" : "bg-primary/10"
      )} />
      
      <h3 className="text-2xl font-semibold mb-8 text-center relative z-10">
        {title}
      </h3>
      
      <div className="grid grid-cols-2 gap-6 relative z-10">
        {documents.map((doc) => (
          <div key={doc.id} className="relative h-56">
            <div 
              className={cn(
                "relative w-full h-full transition-transform duration-700",
                flippedCards[doc.id] ? "[transform:rotateY(180deg)]" : ""
              )}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front */}
              <div 
                className={cn(
                  "absolute inset-0 backdrop-blur-md rounded-xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer border transition-all",
                  doc.checked
                    ? "bg-green-900/30 border-green-500/40 shadow-[0_8px_32px_rgba(34,197,94,0.25)]"
                    : "bg-slate-900/30 border-slate-700/40 hover:border-primary/50 hover:shadow-[0_8px_32px_rgba(59,130,246,0.15)]"
                )}
                style={{ backfaceVisibility: "hidden" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className={cn(
                  "w-14 h-14 rounded-lg flex items-center justify-center border",
                  doc.checked 
                    ? "bg-green-500/10 border-green-500/30" 
                    : "bg-primary/10 border-primary/30"
                )}>
                  <FileCheck className={cn("w-7 h-7", doc.checked ? "text-green-400" : "text-primary")} />
                </div>
                <p className="font-medium text-center text-sm leading-tight">{doc.label}</p>
                <Checkbox
                  checked={doc.checked}
                  onCheckedChange={(checked) => handleToggle(doc.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                  className="scale-125"
                />
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 backdrop-blur-md bg-primary/20 rounded-xl p-6 flex flex-col justify-between cursor-pointer border border-primary/40 shadow-[0_8px_32px_rgba(59,130,246,0.25)]"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className="space-y-3">
                  <h4 className="font-semibold text-base">Document Vault</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {doc.label} protected in secure storage.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-primary/10 border-primary/40 hover:bg-primary/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Navigate to folder");
                  }}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Open Vault
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
