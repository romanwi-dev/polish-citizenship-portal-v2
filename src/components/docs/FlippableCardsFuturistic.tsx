import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Binary, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface DocumentItem {
  id: string;
  label: string;
  checked: boolean;
}

interface FlippableCardsFuturisticProps {
  title: string;
  documents: DocumentItem[];
  onChange: (documents: DocumentItem[]) => void;
}

export const FlippableCardsFuturistic = ({ title, documents, onChange }: FlippableCardsFuturisticProps) => {
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
      "p-8 rounded-none border-2 transition-all duration-700 relative overflow-hidden",
      allChecked 
        ? "bg-gradient-to-br from-green-950 to-emerald-950 border-green-400" 
        : "bg-gradient-to-br from-slate-950 to-blue-950 border-blue-400"
    )}>
      {/* Geometric pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 4px),
                         repeating-linear-gradient(90deg, transparent, transparent 2px, currentColor 2px, currentColor 4px)`
      }} />
      
      <h3 className="text-2xl font-mono font-bold mb-8 text-center uppercase tracking-[0.3em] relative z-10 text-blue-400">
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
                className={cn(
                  "absolute inset-0 border-2 rounded-none p-6 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all clip-corners",
                  doc.checked
                    ? "bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-400 shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                    : "bg-gradient-to-br from-slate-900/50 to-blue-900/50 border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]"
                )}
                style={{ backfaceVisibility: "hidden" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className={cn(
                  "w-16 h-16 border-2 flex items-center justify-center clip-corners",
                  doc.checked ? "border-green-400 bg-green-500/20" : "border-blue-400 bg-blue-500/20"
                )}>
                  <Binary className={cn("w-8 h-8", doc.checked ? "text-green-400" : "text-blue-400")} />
                </div>
                <p className="font-mono font-bold text-center text-xs uppercase tracking-wider">
                  {doc.label}
                </p>
                <Checkbox
                  checked={doc.checked}
                  onCheckedChange={(checked) => handleToggle(doc.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                  className="scale-125 border-blue-400"
                />
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-cyan-900/60 to-teal-900/60 border-2 border-cyan-400 rounded-none p-6 flex flex-col justify-between cursor-pointer shadow-[0_0_25px_rgba(6,182,212,0.3)] clip-corners"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                onClick={() => toggleFlip(doc.id)}
              >
                <div className="space-y-3">
                  <h4 className="font-mono font-bold text-sm uppercase tracking-wider text-cyan-300">
                    DATA.ARCHIVE
                  </h4>
                  <p className="text-xs font-mono text-cyan-100 leading-relaxed">
                    {doc.label.toUpperCase()} // ENCRYPTED_STORAGE_0x42
                  </p>
                </div>
                <Button
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-mono uppercase tracking-wider border-2 border-cyan-400 rounded-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Navigate to folder
                  }}
                >
                  <Database className="w-4 h-4 mr-2" />
                  ACCESS_DB
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
