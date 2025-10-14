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
  colorScheme?: 'children' | 'applicant' | 'spouse' | 'parents' | 'grandparents' | 'ggp';
}

const colorSchemes = {
  children: {
    bg: 'from-cyan-400 to-teal-500',
    cardBg: 'bg-cyan-100/60 dark:bg-cyan-900/60',
    cardBorder: 'border-cyan-300/10 dark:border-cyan-500/10',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    button: 'bg-cyan-500/10 border-cyan-500/40 hover:bg-cyan-500/20',
    glow: 'rgba(34, 211, 238, 0.3)',
    titleColor: 'text-cyan-600/80 dark:text-cyan-400/80',
  },
  applicant: {
    bg: 'from-blue-400 to-blue-600',
    cardBg: 'bg-blue-50/60 dark:bg-blue-950/60',
    cardBorder: 'border-blue-200/10 dark:border-blue-800/10',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    button: 'bg-blue-500/10 border-blue-500/40 hover:bg-blue-500/20',
    glow: 'rgba(59, 130, 246, 0.3)',
    titleColor: 'text-blue-600/80 dark:text-blue-400/80',
  },
  spouse: {
    bg: 'from-blue-300 to-blue-500',
    cardBg: 'bg-blue-50/45 dark:bg-blue-900/45',
    cardBorder: 'border-blue-200/8 dark:border-blue-700/8',
    badge: 'bg-blue-400/10 text-blue-300 border-blue-400/15',
    button: 'bg-blue-400/10 border-blue-400/30 hover:bg-blue-400/20',
    glow: 'rgba(96, 165, 250, 0.25)',
    titleColor: 'text-blue-400/80 dark:text-blue-300/80',
  },
  parents: {
    bg: 'from-teal-400 to-teal-600',
    cardBg: 'bg-teal-50/60 dark:bg-teal-950/60',
    cardBorder: 'border-teal-400/10 dark:border-teal-600/10',
    badge: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
    button: 'bg-teal-500/10 border-teal-500/40 hover:bg-teal-500/20',
    glow: 'rgba(20, 184, 166, 0.3)',
    titleColor: 'text-teal-600/80 dark:text-teal-400/80',
  },
  grandparents: {
    bg: 'from-red-400 to-red-600',
    cardBg: 'bg-red-50/60 dark:bg-red-950/60',
    cardBorder: 'border-red-400/10 dark:border-red-600/10',
    badge: 'bg-red-500/10 text-red-400 border-red-500/20',
    button: 'bg-red-500/10 border-red-500/40 hover:bg-red-500/20',
    glow: 'rgba(239, 68, 68, 0.3)',
    titleColor: 'text-red-600/80 dark:text-red-400/80',
  },
  ggp: {
    bg: 'from-gray-400 to-gray-600',
    cardBg: 'bg-gray-100/60 dark:bg-gray-800/60',
    cardBorder: 'border-gray-200/10 dark:border-gray-600/10',
    badge: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
    button: 'bg-gray-500/10 border-gray-500/40 hover:bg-gray-500/20',
    glow: 'rgba(156, 163, 175, 0.3)',
    titleColor: 'text-gray-600/80 dark:text-gray-400/80',
  },
};

export const FlippableCardsDarkGlow = ({ title, documents, onChange, colorScheme = 'applicant' }: FlippableCardsDarkGlowProps) => {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const scheme = colorSchemes[colorScheme];

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
      case 'critical': return <span className={`text-xs px-3 py-1 rounded-full ${scheme.badge}`}>Critical</span>;
      case 'high': return <span className={`text-xs px-3 py-1 rounded-full ${scheme.badge}`}>High</span>;
      case 'medium': return <span className={`text-xs px-3 py-1 rounded-full ${scheme.badge}`}>Medium</span>;
      case 'low': return <span className={`text-xs px-3 py-1 rounded-full ${scheme.badge}`}>Low</span>;
      default: return null;
    }
  };

  const getDifficultyBadge = (difficulty?: string) => {
    switch (difficulty) {
      case 'hard': return <span className={`text-xs px-3 py-1 rounded-full ${scheme.badge}`}>Hard</span>;
      case 'medium': return <span className={`text-xs px-3 py-1 rounded-full ${scheme.badge}`}>Medium</span>;
      case 'easy': return <span className={`text-xs px-3 py-1 rounded-full ${scheme.badge}`}>Easy</span>;
      default: return null;
    }
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-5xl md:text-6xl font-black font-heading bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-6">
          {title}
        </h3>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6 w-full auto-rows-fr">
        {documents.map((doc, index) => (
          <motion.div 
            key={doc.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="relative w-full min-h-0"
          >
            <div 
              className="relative w-full h-[380px]"
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
                    "absolute inset-0 p-6 rounded-lg group border-2",
                    scheme.cardBg,
                    scheme.cardBorder,
                    !doc.checked && "hover-glow",
                    doc.checked && "border-green-500/40"
                  )}
                  style={{ 
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    boxShadow: doc.checked ? 'none' : `0 8px 32px ${scheme.glow}`
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
                      className={`text-xl md:text-2xl font-heading font-black tracking-tight ${scheme.titleColor} group-hover:scale-105 transition-all duration-300 text-center mt-8 mb-3 leading-tight`}
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
                      <div className={`bg-background/5 rounded-lg p-4 border ${scheme.badge.split(' ').find(c => c.startsWith('border-'))} h-full`}>
                        <p className="text-sm text-muted-foreground italic">
                          [Admin: Add detailed information about this document here. This content will be customized for each document to provide additional context, requirements, or important notes for clients.]
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className={`w-full ${scheme.button} mt-2`}
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