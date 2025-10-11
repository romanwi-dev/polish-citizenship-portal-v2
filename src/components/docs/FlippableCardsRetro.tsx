import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { File, Archive } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentItem {
  id: string;
  label: string;
  checked: boolean;
}

interface FlippableCardsRetroProps {
  title: string;
  documents: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}

export const FlippableCardsRetro = ({ title, documents, onChange }: FlippableCardsRetroProps) => {
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
      "p-8 rounded-none border-4 transition-all duration-700 relative",
      allChecked 
        ? "bg-amber-50 border-green-700 shadow-[8px_8px_0_rgba(21,128,61,0.3)]" 
        : "bg-amber-50 border-amber-900 shadow-[8px_8px_0_rgba(120,53,15,0.2)]"
    )}>
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
      
      <h3 className="text-2xl font-serif font-bold mb-8 text-center text-amber-900 uppercase tracking-widest">
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
                  "absolute inset-0 border-4 rounded-none p-6 flex flex-col items-center justify-center gap-4 cursor-pointer shadow-[4px_4px_0_rgba(0,0,0,0.1)] hover:shadow-[6px_6px_0_rgba(0,0,0,0.15)] transition-all",
                  doc.checked
                    ? "bg-green-100 border-green-700"
                    : "bg-yellow-50 border-amber-700"
                )}
                style={{ backfaceVisibility: "hidden" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className={cn(
                  "w-16 h-16 rounded-full border-4 flex items-center justify-center",
                  doc.checked ? "border-green-700 bg-green-200" : "border-amber-700 bg-amber-200"
                )}>
                  <File className={cn("w-8 h-8", doc.checked ? "text-green-800" : "text-amber-800")} />
                </div>
                <p className="font-serif font-bold text-center text-sm uppercase tracking-wide text-amber-900">
                  {doc.label}
                </p>
                <Checkbox
                  checked={doc.checked}
                  onCheckedChange={(checked) => handleToggle(doc.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                  className="scale-125 border-2 border-amber-900"
                />
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-orange-100 to-red-100 border-4 border-red-700 rounded-none p-6 flex flex-col justify-between cursor-pointer shadow-[4px_4px_0_rgba(0,0,0,0.1)]"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className="space-y-3">
                  <h4 className="font-serif font-bold text-lg text-red-900 uppercase">Filed Copy</h4>
                  <p className="text-xs font-serif text-red-800 leading-relaxed">
                    {doc.label} archived in filing cabinet No. 42.
                  </p>
                </div>
                <Button
                  className="w-full bg-red-700 hover:bg-red-600 text-white font-serif uppercase tracking-wide border-2 border-red-900 rounded-none shadow-[2px_2px_0_rgba(0,0,0,0.2)]"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Navigate to folder");
                  }}
                >
                  <Archive className="w-4 h-4 mr-2" />
                  Open Cabinet
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
