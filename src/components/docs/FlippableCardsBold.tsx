import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileText, FolderOpen, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentItem {
  id: string;
  label: string;
  checked: boolean;
}

interface FlippableCardsBoldProps {
  title: string;
  documents: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}

export const FlippableCardsBold = ({ title, documents, onChange }: FlippableCardsBoldProps) => {
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
  const completedCount = documents.filter(d => d.checked).length;

  return (
    <div className={cn(
      "p-8 rounded-2xl border-4 transition-all duration-700 shadow-xl",
      allChecked 
        ? "bg-gradient-to-br from-green-900/60 to-green-800/60 border-green-500" 
        : "bg-gradient-to-br from-slate-900/60 to-slate-800/60 border-slate-600"
    )}>
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-3xl font-black">{title}</h3>
        <div className="flex items-center gap-2 text-lg font-bold">
          <CheckCircle2 className="w-6 h-6" />
          {completedCount}/{documents.length}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="relative h-60"
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
                  "absolute inset-0 border-4 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer shadow-lg transition-all hover:scale-105",
                  doc.checked 
                    ? "bg-green-500/20 border-green-400" 
                    : "bg-blue-500/10 border-blue-400/50 hover:border-blue-400"
                )}
                style={{ backfaceVisibility: "hidden" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center",
                  doc.checked ? "bg-green-500/30" : "bg-blue-500/20"
                )}>
                  <FileText className="w-10 h-10" />
                </div>
                <p className="font-bold text-center text-lg leading-tight">{doc.label}</p>
                <Checkbox
                  checked={doc.checked}
                  onCheckedChange={(checked) => handleToggle(doc.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                  className="scale-150"
                />
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-4 border-purple-400 rounded-2xl p-6 flex flex-col justify-between cursor-pointer shadow-lg"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className="space-y-3">
                  <h4 className="font-black text-xl">STORED COPY</h4>
                  <p className="text-sm font-medium">
                    This document is saved in your personal secure folder and ready for review.
                  </p>
                </div>
                <Button
                  size="lg"
                  className="w-full font-bold text-base"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Navigate to folder");
                  }}
                >
                  <FolderOpen className="w-5 h-5 mr-2" />
                  OPEN FOLDER
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
