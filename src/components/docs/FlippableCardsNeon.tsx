import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileText, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentItem {
  id: string;
  label: string;
  checked: boolean;
}

interface FlippableCardsNeonProps {
  title: string;
  documents: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}

export const FlippableCardsNeon = ({ title, documents, onChange }: FlippableCardsNeonProps) => {
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
      "p-8 rounded-2xl border-2 transition-all duration-700 relative",
      allChecked 
        ? "bg-black border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.5)]" 
        : "bg-black border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)]"
    )}>
      <h3 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        {title}
      </h3>
      
      <div className="grid grid-cols-2 gap-6">
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
                className={cn(
                  "absolute inset-0 bg-black border-2 rounded-xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all",
                  doc.checked
                    ? "border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                    : "border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                )}
                style={{ backfaceVisibility: "hidden" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center",
                  doc.checked ? "bg-green-500/20" : "bg-cyan-500/20"
                )}>
                  <Zap className={cn("w-8 h-8", doc.checked ? "text-green-400" : "text-cyan-400")} />
                </div>
                <p className="font-bold text-center text-white">{doc.label}</p>
                <Checkbox
                  checked={doc.checked}
                  onCheckedChange={(checked) => handleToggle(doc.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                  className="scale-125 border-cyan-400"
                />
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-purple-900/80 to-pink-900/80 border-2 border-purple-400 rounded-xl p-6 flex flex-col justify-between cursor-pointer shadow-[0_0_25px_rgba(168,85,247,0.4)]"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className="space-y-3">
                  <h4 className="font-bold text-lg text-purple-200">Neon Archive</h4>
                  <p className="text-sm text-purple-100">
                    {doc.label} stored with holographic encryption.
                  </p>
                </div>
                <Button
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white border border-purple-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to folder
                  }}
                >
                  Access Vault
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
