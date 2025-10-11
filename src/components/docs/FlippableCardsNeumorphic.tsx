import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileText, FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentItem {
  id: string;
  label: string;
  checked: boolean;
}

interface FlippableCardsNeumorphicProps {
  title: string;
  documents: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}

export const FlippableCardsNeumorphic = ({ title, documents, onChange }: FlippableCardsNeumorphicProps) => {
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
      "p-8 rounded-3xl transition-all duration-700",
      allChecked 
        ? "bg-green-100" 
        : "bg-gray-200"
    )}>
      <h3 className={cn(
        "text-2xl font-semibold mb-8 text-center",
        allChecked ? "text-green-800" : "text-gray-700"
      )}>
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
                  "absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all",
                  doc.checked
                    ? "bg-green-100 shadow-[8px_8px_16px_#b8d4b8,-8px_-8px_16px_#d4f0d4]"
                    : "bg-gray-200 shadow-[8px_8px_16px_#b8b8b8,-8px_-8px_16px_#e8e8e8] hover:shadow-[12px_12px_24px_#b0b0b0,-12px_-12px_24px_#f0f0f0]"
                )}
                style={{ backfaceVisibility: "hidden" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center",
                  doc.checked
                    ? "shadow-[inset_4px_4px_8px_#b8d4b8,inset_-4px_-4px_8px_#d4f0d4]"
                    : "shadow-[inset_4px_4px_8px_#b8b8b8,inset_-4px_-4px_8px_#e8e8e8]"
                )}>
                  <FileText className={cn("w-8 h-8", doc.checked ? "text-green-700" : "text-gray-600")} />
                </div>
                <p className={cn(
                  "font-semibold text-center text-sm",
                  doc.checked ? "text-green-800" : "text-gray-700"
                )}>
                  {doc.label}
                </p>
                <Checkbox
                  checked={doc.checked}
                  onCheckedChange={(checked) => handleToggle(doc.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                  className="scale-125"
                />
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl p-6 flex flex-col justify-between cursor-pointer shadow-[8px_8px_16px_#c0d0e0,-8px_-8px_16px_#e0f0ff]"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg text-blue-800">Soft Archive</h4>
                  <p className="text-sm text-blue-700 leading-relaxed">
                    {doc.label} safely stored with gentle protection.
                  </p>
                </div>
                <Button
                  className="w-full bg-gradient-to-br from-blue-200 to-purple-200 text-blue-900 hover:from-blue-300 hover:to-purple-300 border-0 shadow-[4px_4px_8px_#c0d0e0,-4px_-4px_8px_#e0f0ff] hover:shadow-[6px_6px_12px_#b8c8d8,-6px_-6px_12px_#e8f8ff]"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Navigate to folder");
                  }}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Open Folder
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
