import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { File, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentItem {
  id: string;
  label: string;
  checked: boolean;
}

interface FlippableCardsShadowProps {
  title: string;
  documents: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}

export const FlippableCardsShadow = ({ title, documents, onChange }: FlippableCardsShadowProps) => {
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
        ? "bg-green-950/40" 
        : "bg-slate-900/40"
    )}>
      <h3 className="text-2xl font-semibold mb-8 text-center">
        {title}
      </h3>
      
      <div className="grid grid-cols-2 gap-6">
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
                  "absolute inset-0 rounded-xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all border",
                  doc.checked
                    ? "bg-gradient-to-br from-green-900/50 to-green-950/50 border-green-700/50 shadow-[0_20px_50px_-12px_rgba(34,197,94,0.4)]"
                    : "bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 shadow-[0_20px_50px_-12px_rgba(59,130,246,0.3)] hover:shadow-[0_20px_50px_-12px_rgba(59,130,246,0.5)]"
                )}
                style={{ backfaceVisibility: "hidden" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className={cn(
                  "w-16 h-16 rounded-xl flex items-center justify-center transition-all",
                  doc.checked 
                    ? "bg-green-800/30 shadow-[inset_0_2px_10px_rgba(34,197,94,0.3)]" 
                    : "bg-primary/20 shadow-[inset_0_2px_10px_rgba(59,130,246,0.2)]"
                )}>
                  <File className={cn("w-8 h-8", doc.checked ? "text-green-300" : "text-primary")} />
                </div>
                <p className="font-semibold text-center leading-tight">{doc.label}</p>
                <Checkbox
                  checked={doc.checked}
                  onCheckedChange={(checked) => handleToggle(doc.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                  className="scale-125"
                />
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-xl p-6 flex flex-col justify-between cursor-pointer border border-primary/50 shadow-[0_20px_50px_-12px_rgba(59,130,246,0.5)]"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className="space-y-3">
                  <h4 className="font-bold text-lg">Archive Copy</h4>
                  <p className="text-sm opacity-90 leading-relaxed">
                    {doc.label} secured in digital archive.
                  </p>
                </div>
                <Button
                  className="w-full bg-primary/80 hover:bg-primary shadow-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Navigate to folder");
                  }}
                >
                  <Database className="w-4 h-4 mr-2" />
                  View Archive
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
