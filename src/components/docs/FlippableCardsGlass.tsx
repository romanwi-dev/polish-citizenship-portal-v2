import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileCheck, Sparkle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentItem {
  id: string;
  label: string;
  checked: boolean;
}

interface FlippableCardsGlassProps {
  title: string;
  documents: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}

export const FlippableCardsGlass = ({ title, documents, onChange }: FlippableCardsGlassProps) => {
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
      "p-8 rounded-3xl border transition-all duration-700 backdrop-blur-xl relative overflow-hidden",
      allChecked 
        ? "bg-green-500/10 border-green-300/30" 
        : "bg-white/5 border-white/10"
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 pointer-events-none" />
      
      <h3 className="text-2xl font-light mb-8 text-center relative z-10 tracking-wider">
        {title}
      </h3>
      
      <div className="grid grid-cols-2 gap-6 relative z-10">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="relative h-56"
          >
            <div className={cn(
              "relative w-full h-full transition-transform duration-700",
              flippedCards[doc.id] ? "[transform:rotateY(180deg)]" : ""
            )}
            style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front */}
              <div 
                className="absolute inset-0 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-white/15 transition-all shadow-xl"
                style={{ backfaceVisibility: "hidden" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  <Sparkle className="w-7 h-7 text-white/80" />
                </div>
                <p className="font-medium text-center text-sm leading-tight">{doc.label}</p>
                <Checkbox
                  checked={doc.checked}
                  onCheckedChange={(checked) => handleToggle(doc.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                  className="scale-125 bg-white/10 border-white/30"
                />
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-lg border border-blue-300/30 rounded-2xl p-6 flex flex-col justify-between cursor-pointer shadow-xl"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className="space-y-3">
                  <h4 className="font-semibold text-base">Glass Archive</h4>
                  <p className="text-xs opacity-80 leading-relaxed">
                    {doc.label} preserved in crystalline storage.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full bg-white/10 backdrop-blur-sm border-white/30 hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Navigate to folder");
                  }}
                >
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
