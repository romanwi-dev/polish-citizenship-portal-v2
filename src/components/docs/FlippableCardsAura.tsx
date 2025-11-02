import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentItem {
  id: string;
  label: string;
  checked: boolean;
}

interface FlippableCardsAuraProps {
  title: string;
  documents: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}

export const FlippableCardsAura = ({ title, documents, onChange }: FlippableCardsAuraProps) => {
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
        ? "bg-gradient-to-br from-green-950/50 via-emerald-950/40 to-green-900/50" 
        : "bg-gradient-to-br from-slate-950/50 via-slate-900/40 to-blue-950/50"
    )}>
      {/* Multiple overlapping glows */}
      <div className={cn(
        "absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl transition-all duration-700",
        allChecked ? "bg-green-500/20" : "bg-primary/20"
      )} />
      <div className={cn(
        "absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-3xl transition-all duration-700",
        allChecked ? "bg-emerald-500/15" : "bg-accent/15"
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
                  "absolute inset-0 backdrop-blur-xl rounded-xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer border transition-all group",
                  doc.checked
                    ? "bg-green-900/20 border-green-500/30"
                    : "bg-slate-900/20 border-slate-600/30 hover:border-primary/50"
                )}
                style={{ backfaceVisibility: "hidden" }}
                onClick={() => toggleFlip(doc.id)}
              >
                {/* Glow on hover */}
                <div className={cn(
                  "absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500",
                  doc.checked 
                    ? "shadow-[inset_0_0_60px_rgba(34,197,94,0.1)]" 
                    : "shadow-[inset_0_0_60px_rgba(59,130,246,0.1)]"
                )} />
                
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center relative z-10",
                  doc.checked 
                    ? "bg-gradient-to-br from-green-500/20 to-emerald-500/20" 
                    : "bg-gradient-to-br from-primary/20 to-accent/20"
                )}>
                  <FileText className={cn("w-8 h-8", doc.checked ? "text-green-400" : "text-primary")} />
                </div>
                <p className="font-medium text-center leading-tight relative z-10">{doc.label}</p>
                <Checkbox
                  checked={doc.checked}
                  onCheckedChange={(checked) => handleToggle(doc.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                  className="scale-125 relative z-10"
                />
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 backdrop-blur-xl bg-gradient-to-br from-primary/25 to-accent/25 rounded-xl p-6 flex flex-col justify-between cursor-pointer border border-primary/40"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">Protected Storage</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {doc.label} encrypted and safely stored.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-primary/10 border-primary/40 hover:bg-primary/20 group/btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to folder
                  }}
                >
                  Access Storage
                  <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
