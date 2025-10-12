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

interface FlippableCardsDeepProps {
  title: string;
  documents: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}

export const FlippableCardsDeep = ({ title, documents, onChange }: FlippableCardsDeepProps) => {
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
    <div className="w-full">
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
                  "absolute inset-0 rounded-xl p-6 flex flex-col items-center justify-center gap-4 cursor-pointer border transition-all glass-card hover-glow",
                  doc.checked
                    ? "bg-green-900/50 border-green-600/40 shadow-[0_0_40px_rgba(34,197,94,0.25),inset_0_1px_0_rgba(255,255,255,0.1)]"
                    : "border-border/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.2),inset_0_1px_0_rgba(255,255,255,0.1)] hover:border-primary/40"
                )}
                style={{ backfaceVisibility: "hidden" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className={cn(
                  "w-16 h-16 rounded-xl flex items-center justify-center border backdrop-blur-sm",
                  doc.checked 
                    ? "bg-green-500/10 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.2)]" 
                    : "bg-primary/10 border-primary/30 shadow-[0_0_20px_rgba(59,130,246,0.15)]"
                )}>
                  <FileText className={cn("w-8 h-8", doc.checked ? "text-green-300" : "text-primary")} />
                </div>
                <p className="font-semibold text-center leading-tight">{doc.label}</p>
                <Checkbox
                  checked={doc.checked}
                  onCheckedChange={(checked) => handleToggle(doc.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                  className="scale-125"
                />
              </div>

              <div 
                className="absolute inset-0 glass-card rounded-xl p-6 flex flex-col justify-between cursor-pointer border border-primary/50 shadow-[0_0_40px_rgba(59,130,246,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover-glow"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-12 bg-gradient-to-b from-primary to-accent rounded-full" />
                    <h4 className="font-bold text-lg">Digital Vault</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {doc.label} stored with encryption.
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-primary/40 hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Navigate to folder");
                  }}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Open Vault
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
