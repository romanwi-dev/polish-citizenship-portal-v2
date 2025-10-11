import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { File, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentItem {
  id: string;
  label: string;
  checked: boolean;
}

interface FlippableCardsMinimalProps {
  title: string;
  documents: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}

export const FlippableCardsMinimal = ({ title, documents, onChange }: FlippableCardsMinimalProps) => {
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
      "p-6 rounded-lg transition-all duration-500 border",
      allChecked ? "bg-green-950/50 border-green-700/50" : "bg-card/30 border-border/50"
    )}>
      <h3 className="text-xl font-medium mb-6 tracking-tight">{title}</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="relative h-44 overflow-hidden rounded-lg"
          >
            <div className={cn(
              "relative w-full h-full transition-transform duration-500",
              flippedCards[doc.id] ? "[transform:rotateY(180deg)]" : ""
            )}
            style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front */}
              <div 
                className="absolute inset-0 bg-background border border-border hover:border-primary/50 transition-colors p-5 flex flex-col justify-between cursor-pointer"
                style={{ backfaceVisibility: "hidden" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className="flex items-start justify-between">
                  <File className="w-6 h-6 text-muted-foreground" />
                  <Checkbox
                    checked={doc.checked}
                    onCheckedChange={(checked) => handleToggle(doc.id, checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <p className="font-medium text-sm leading-tight">{doc.label}</p>
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 bg-primary/10 border border-primary p-5 flex flex-col justify-between cursor-pointer"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div>
                  <p className="text-xs font-medium mb-2">Stored Document</p>
                  <p className="text-xs text-muted-foreground">Accessible in your secure folder</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full justify-between"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Navigate to folder");
                  }}
                >
                  <span>Access</span>
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
