import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentItem {
  id: string;
  label: string;
  checked: boolean;
  importance?: 'critical' | 'high' | 'medium' | 'low';
  difficulty?: 'easy' | 'medium' | 'hard';
  description?: string;
}

interface FlippableCardsDarkGlowProps {
  title: string;
  documents: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}

export const FlippableCardsDarkGlow = ({ title, documents, onChange }: FlippableCardsDarkGlowProps) => {
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

  const getImportanceBadge = (importance?: string) => {
    switch (importance) {
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      case 'high': return <Badge variant="vip">High</Badge>;
      case 'medium': return <Badge variant="expedited">Medium</Badge>;
      case 'low': return <Badge variant="standard">Low</Badge>;
      default: return null;
    }
  };

  const getDifficultyBadge = (difficulty?: string) => {
    switch (difficulty) {
      case 'hard': return <Badge variant="vipPlus">Hard</Badge>;
      case 'medium': return <Badge variant="expedited">Medium</Badge>;
      case 'easy': return <Badge variant="standard">Easy</Badge>;
      default: return null;
    }
  };

  return (
    <div className={cn(
      "p-8 rounded-xl transition-all duration-700 relative",
      allChecked 
        ? "bg-green-950/30 border border-green-500/30" 
        : "bg-gradient-to-br from-slate-950/40 to-indigo-950/30 border border-slate-700/20"
    )}>
      <div className="flex items-center gap-3 mb-6">
        <Checkbox
          checked={allChecked}
          onCheckedChange={(checked) => {
            const updated = documents.map(doc => ({ ...doc, checked: checked as boolean }));
            onChange(updated);
          }}
          className="scale-125"
        />
        <h3 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
          {title}
        </h3>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {documents.map((doc) => (
          <div key={doc.id} className="relative" style={{ aspectRatio: '1/1.414', maxWidth: '280px' }}>
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
                  "absolute inset-0 backdrop-blur-md rounded-xl p-5 flex flex-col cursor-pointer border transition-all",
                  doc.checked
                    ? "bg-green-900/40 border-green-500/40 shadow-[0_0_30px_rgba(34,197,94,0.3)]"
                    : "bg-slate-900/20 border-slate-700/30 hover:border-primary/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                )}
                style={{ backfaceVisibility: "hidden" }}
                onClick={() => toggleFlip(doc.id)}
              >
                {/* Title at top */}
                <h4 className="text-base font-black mb-3 text-center leading-tight font-heading">
                  {doc.label}
                </h4>

                {/* Description in middle */}
                <div className="flex-1 flex items-center justify-center px-2">
                  <p className="text-xs text-muted-foreground text-center leading-relaxed">
                    {doc.description || "Document required for citizenship application processing."}
                  </p>
                </div>

                {/* Checkbox and badges at bottom */}
                <div className="space-y-2 mt-auto">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={doc.checked}
                      onCheckedChange={(checked) => handleToggle(doc.id, checked as boolean)}
                      onClick={(e) => e.stopPropagation()}
                      className="scale-110"
                    />
                  </div>
                  <div className="flex gap-1.5 justify-center flex-wrap text-xs">
                    {getImportanceBadge(doc.importance)}
                    {getDifficultyBadge(doc.difficulty)}
                  </div>
                </div>
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 backdrop-blur-md bg-primary/15 rounded-xl p-6 flex flex-col cursor-pointer border border-primary/30 shadow-[0_0_40px_rgba(59,130,246,0.2)]"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                onClick={() => toggleFlip(doc.id)}
              >
                {/* Title at top */}
                <h4 className="text-base font-black mb-4 text-center font-heading">
                  {doc.label}
                </h4>

                {/* Document copy placeholder in middle */}
                <div className="flex-1 overflow-auto">
                  <div className="bg-background/5 rounded-lg p-4 border border-primary/20">
                    <p className="text-xs text-muted-foreground/80 leading-relaxed">
                      [Document Copy Placeholder]
                      <br /><br />
                      This area will display the actual document content, scanned copy, or official certificate once uploaded to the secure vault.
                    </p>
                  </div>
                </div>

                {/* Button at bottom */}
                <Button
                  variant="outline"
                  className="w-full mt-4 bg-primary/10 border-primary/40 hover:bg-primary/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log("Access folder for:", doc.label);
                  }}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Access Folder
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
