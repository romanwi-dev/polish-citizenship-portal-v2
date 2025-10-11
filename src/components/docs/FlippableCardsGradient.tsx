import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileCheck, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentItem {
  id: string;
  label: string;
  checked: boolean;
}

interface FlippableCardsGradientProps {
  title: string;
  documents: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}

export const FlippableCardsGradient = ({ title, documents, onChange }: FlippableCardsGradientProps) => {
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
      "p-8 rounded-xl border-2 transition-all duration-700",
      allChecked ? "bg-gradient-to-br from-green-900/40 to-emerald-900/40 border-green-600" : "bg-gradient-to-br from-card/80 to-card/40 border-border"
    )}>
      <h3 className="text-2xl font-bold mb-8 text-center">{title}</h3>
      
      <div className="grid grid-cols-2 gap-6">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="relative h-56 group"
          >
            <div className={cn(
              "relative w-full h-full transition-all duration-700 transform",
              flippedCards[doc.id] ? "[transform:rotateY(180deg)]" : ""
            )}
            style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border-2 border-primary/40 rounded-xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:shadow-lg hover:shadow-primary/20 transition-shadow"
                style={{ backfaceVisibility: "hidden" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <FileCheck className="w-8 h-8 text-primary" />
                </div>
                <p className="font-semibold text-center">{doc.label}</p>
                <Checkbox
                  checked={doc.checked}
                  onCheckedChange={(checked) => handleToggle(doc.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                  className="scale-125"
                />
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-primary/60 rounded-xl p-6 flex flex-col justify-between cursor-pointer"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className="space-y-3">
                  <h4 className="font-bold text-lg">Document Details</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Your {doc.label.toLowerCase()} will be securely stored and accessible anytime.
                  </p>
                </div>
                <Button
                  className="w-full group/btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Navigate to folder");
                  }}
                >
                  View in Folder
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
