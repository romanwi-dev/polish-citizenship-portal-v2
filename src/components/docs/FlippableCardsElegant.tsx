import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FileText, Folder, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentItem {
  id: string;
  label: string;
  checked: boolean;
}

interface FlippableCardsElegantProps {
  title: string;
  documents: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}

export const FlippableCardsElegant = ({ title, documents, onChange }: FlippableCardsElegantProps) => {
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
      "p-10 rounded-3xl border-2 transition-all duration-700 relative overflow-hidden",
      allChecked 
        ? "bg-gradient-to-br from-emerald-900/50 via-green-900/40 to-teal-900/50 border-emerald-500/50" 
        : "bg-gradient-to-br from-slate-900/30 via-slate-800/20 to-slate-900/30 border-slate-700/50"
    )}>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl" />
      
      <div className="relative">
        <div className="flex items-center justify-center gap-3 mb-8">
          <Sparkles className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-serif font-semibold tracking-wide">{title}</h3>
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        
        <div className="grid grid-cols-2 gap-8">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="relative h-64"
            >
              <div className={cn(
                "relative w-full h-full transition-transform duration-700",
                flippedCards[doc.id] ? "[transform:rotateY(180deg)]" : ""
              )}
              style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border-2 border-primary/20 rounded-2xl p-8 flex flex-col items-center justify-center gap-5 cursor-pointer hover:border-primary/40 transition-all hover:shadow-2xl hover:shadow-primary/10"
                  style={{ backfaceVisibility: "hidden" }}
                  onClick={() => toggleFlip(doc.id)}
                >
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <FileText className="w-8 h-8 text-primary" />
                    </div>
                    {doc.checked && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                  <p className="font-serif font-medium text-center text-base leading-snug">{doc.label}</p>
                  <Checkbox
                    checked={doc.checked}
                    onCheckedChange={(checked) => handleToggle(doc.id, checked as boolean)}
                    onClick={(e) => e.stopPropagation()}
                    className="scale-125"
                  />
                </div>

                {/* Back */}
                <div 
                  className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/15 to-primary/10 backdrop-blur-sm border-2 border-primary/40 rounded-2xl p-8 flex flex-col justify-between cursor-pointer"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  onClick={() => toggleFlip(doc.id)}
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-8 bg-primary rounded-full" />
                      <h4 className="font-serif font-semibold text-lg">Document Copy</h4>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed font-light">
                      Your {doc.label.toLowerCase()} is securely archived and available for instant access in your dedicated folder.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full group border-2 hover:bg-primary/10"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Navigate to folder
                    }}
                  >
                    <Folder className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Access Folder</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
