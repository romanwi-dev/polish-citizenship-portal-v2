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

interface FlippableCards3DProps {
  title: string;
  documents: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}

export const FlippableCards3D = ({ title, documents, onChange }: FlippableCards3DProps) => {
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
      "p-6 rounded-lg border-2 transition-all duration-500",
      allChecked ? "bg-green-900/40 border-green-700" : "bg-card/50 border-border"
    )}>
      <h3 className="text-xl font-semibold mb-6">{title}</h3>
      
      <div className="grid grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="relative h-48 cursor-pointer perspective-1000"
            onClick={() => toggleFlip(doc.id)}
          >
            <div className={cn(
              "relative w-full h-full transition-transform duration-700 transform-style-3d",
              flippedCards[doc.id] ? "rotate-y-180" : ""
            )}>
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-2 border-primary/30 rounded-lg p-4 flex flex-col items-center justify-center gap-3">
                <FileText className="w-12 h-12 text-primary" />
                <p className="font-medium text-center text-sm">{doc.label}</p>
                <Checkbox
                  checked={doc.checked}
                  onCheckedChange={(checked) => handleToggle(doc.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180 bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary rounded-lg p-4 flex flex-col justify-between">
                <div className="text-xs space-y-2">
                  <p className="font-semibold">Document Copy</p>
                  <p className="text-muted-foreground">This document will be stored securely in your folder.</p>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to folder
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
