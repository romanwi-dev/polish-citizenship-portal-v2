import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
      case 'critical': return <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">Critical</span>;
      case 'high': return <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">High</span>;
      case 'medium': return <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">Medium</span>;
      case 'low': return <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">Low</span>;
      default: return null;
    }
  };

  const getDifficultyBadge = (difficulty?: string) => {
    switch (difficulty) {
      case 'hard': return <span className="text-xs px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">Hard</span>;
      case 'medium': return <span className="text-xs px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">Medium</span>;
      case 'easy': return <span className="text-xs px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">Easy</span>;
      default: return null;
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-6">
        <Checkbox
          checked={allChecked}
          onCheckedChange={(checked) => {
            const updated = documents.map(doc => ({ ...doc, checked: checked as boolean }));
            onChange(updated);
          }}
          className="scale-125"
        />
        {title && (
          <h3 className="text-5xl md:text-6xl font-black font-heading bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {title}
          </h3>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 w-full">
        {documents.map((doc, index) => (
          <motion.div 
            key={doc.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="relative w-full"
          >
            <div 
              className="relative w-full h-[450px]"
              style={{ perspective: '1000px' }}
            >
              <div 
                onClick={() => toggleFlip(doc.id)}
                className="absolute inset-0 cursor-pointer transition-transform duration-700"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: flippedCards[doc.id] ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Front Side */}
                <motion.div
                  whileHover={doc.checked ? {} : { scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "absolute inset-0 glass-card p-6 rounded-lg group",
                    !doc.checked && "hover-glow",
                    doc.checked && "border-green-500/40 opacity-60"
                  )}
                  style={{ 
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    boxShadow: doc.checked ? 'none' : undefined
                  }}
                >
                  <div className="flex flex-col gap-3 h-full">
                    {/* Checkbox at top left corner */}
                    <div className="absolute top-3 left-3">
                      <Checkbox
                        checked={doc.checked}
                        onCheckedChange={(checked) => handleToggle(doc.id, checked as boolean)}
                        onClick={(e) => e.stopPropagation()}
                        className="scale-125 opacity-60 hover:opacity-100 transition-opacity"
                      />
                    </div>

                    {/* Title at top center */}
                    <motion.h4 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: index * 0.08,
                        type: "spring",
                        stiffness: 60,
                        damping: 15
                      }}
                      className="text-xl md:text-2xl font-heading font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-105 transition-all duration-300 drop-shadow-lg text-center mt-8 mb-3 leading-tight"
                    >
                      {doc.label}
                    </motion.h4>

                    {/* Empty space in middle */}
                    <div className="flex-1" />

                    {/* Badges at bottom */}
                    <div className="flex gap-2 justify-center flex-wrap text-xs mt-auto">
                      {getImportanceBadge(doc.importance)}
                      {getDifficultyBadge(doc.difficulty)}
                    </div>
                    
                    <p className="text-xs text-muted-foreground/60 mt-2 text-center">Tap to see details</p>
                  </div>
                </motion.div>

                {/* Back Side */}
                <div 
                  className="absolute inset-0 glass-card p-6 rounded-lg hover-glow"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="flex flex-col gap-3 h-full">
                    <h4 className="text-xl font-heading font-bold tracking-tight text-card-foreground mb-2">
                      More Information
                    </h4>
                    
                    <div className="flex-1 overflow-auto">
                      <div className="bg-background/5 rounded-lg p-4 border border-primary/20 h-full">
                        <p className="text-sm text-muted-foreground italic">
                          [Admin: Add detailed information about this document here. This content will be customized for each document to provide additional context, requirements, or important notes for clients.]
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full bg-primary/10 border-primary/40 hover:bg-primary/20 mt-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Access folder for:", doc.label);
                      }}
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      Access Folder
                    </Button>
                    
                    <p className="text-xs text-muted-foreground/60 text-center">Tap to flip back</p>
                  </div>
                </div>
              </div>
            </div>
            </motion.div>
          ))}
      </div>
    </div>
  );
};