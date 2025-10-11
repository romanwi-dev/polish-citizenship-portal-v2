import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentItem {
  id: string;
  label: string;
  checked: boolean;
}

interface FlippableCardsDarkGlowProps {
  title: string;
  documents: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}

export const FlippableCardsDarkGlow = ({ title, documents, onChange }: FlippableCardsDarkGlowProps) => {
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
      "p-8 rounded-xl transition-all duration-700 relative overflow-hidden",
      allChecked 
        ? "bg-gradient-to-br from-green-950/50 to-emerald-950/40" 
        : "bg-gradient-to-br from-slate-900/50 to-slate-800/40"
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      
      <h3 className="text-2xl font-semibold mb-8 text-center relative z-10 glow-text">
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
                  "absolute inset-0 glass-card rounded-xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all",
                  doc.checked
                    ? "border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                    : "hover:shadow-[0_0_30px_rgba(59,130,246,0.2)] hover:border-primary/50"
                )}
                style={{ backfaceVisibility: "hidden" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-sm",
                  doc.checked 
                    ? "bg-green-500/20 shadow-[0_0_20px_rgba(34,197,94,0.3)]" 
                    : "bg-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                )}>
                  <FileText className={cn("w-8 h-8", doc.checked ? "text-green-400" : "text-primary")} />
                </div>
                <p className="font-medium text-center leading-tight">{doc.label}</p>
                <Checkbox
                  checked={doc.checked}
                  onCheckedChange={(checked) => handleToggle(doc.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                  className="scale-125"
                />
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 glass-card rounded-xl p-6 flex flex-col justify-between cursor-pointer border-primary/50 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg glow-text">Secured Archive</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {doc.label} safely stored in your encrypted vault.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full hover-glow border-primary/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Navigate to folder");
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Access Folder
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
