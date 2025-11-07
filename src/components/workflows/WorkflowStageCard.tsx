import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface WorkflowStageCardProps {
  number: string;
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  agent: 'human' | 'ai' | 'both';
  backDetails: string;
  isCompleted: boolean;
  isFlipped: boolean;
  docCount: number;
  stageDocuments: any[];
  onFlip: () => void;
  onToggleComplete: () => void;
  uploadSection?: React.ReactNode;
  getDocumentThumbnail: (doc: any) => string | null;
}

export function WorkflowStageCard({
  number,
  title,
  description,
  icon: Icon,
  gradient,
  agent,
  backDetails,
  isCompleted,
  isFlipped,
  docCount,
  stageDocuments,
  onFlip,
  onToggleComplete,
  uploadSection,
  getDocumentThumbnail,
}: WorkflowStageCardProps) {
  const isMobile = useIsMobile();

  return (
    <div 
      className="relative h-[450px]"
      style={{ perspective: '1000px' }}
    >
      <div
        onClick={onFlip}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onFlip();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`${title} - ${isMobile ? 'Tap' : 'Click'} to view details`}
        className="absolute inset-0 cursor-pointer transition-transform duration-700 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front Side */}
        <div 
          className={cn(
            "absolute inset-0 glass-card p-6 rounded-lg transition-all duration-300",
            isCompleted 
              ? "ring-2 ring-green-500/50" 
              : "hover-glow hover:scale-[1.02]"
          )}
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            boxShadow: isCompleted 
              ? '0 0 20px rgba(34, 197, 94, 0.2)' 
              : undefined,
            pointerEvents: isCompleted ? 'none' : 'auto',
          }}
        >
          <div className="flex flex-col gap-3 h-full">
            {/* Header */}
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm md:text-xs font-bold px-3 py-1.5 md:px-2 md:py-1 rounded-full bg-gradient-to-r ${gradient} text-white`}>
                {number}
              </span>
              <Badge variant={agent === 'ai' ? 'default' : agent === 'human' ? 'secondary' : 'outline'} className="text-xs">
                {agent === 'ai' ? 'AI' : agent === 'human' ? 'HAC' : 'AI+HAC'}
              </Badge>
            </div>

            {/* Completed Badge */}
            {isCompleted && (
              <div className="absolute top-4 right-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white shadow-lg">
                  <motion.svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.path d="M5 13l4 4L19 7" />
                  </motion.svg>
                </div>
              </div>
            )}

            {/* Icon */}
            <div className={cn(
              "mb-3 flex h-16 md:h-20 items-center justify-center rounded-lg",
              isCompleted 
                ? "bg-green-500/10" 
                : "bg-gradient-to-br from-primary/10 to-secondary/10"
            )}>
              <Icon className={cn(
                "h-10 w-10 md:h-12 md:w-12",
                isCompleted ? "text-green-500" : "text-primary"
              )} />
            </div>

            {/* Title */}
            <h3 className={cn(
              "text-2xl md:text-3xl font-heading font-black tracking-tight bg-clip-text text-transparent drop-shadow-lg",
              isCompleted 
                ? "bg-gradient-to-r from-green-500 to-green-600" 
                : "bg-gradient-to-r from-primary to-secondary"
            )}>
              {title}
            </h3>

            {/* Description */}
            <p className="text-xs md:text-sm text-muted-foreground mb-3 flex-1 line-clamp-3">
              {description}
            </p>

            {/* Upload Section */}
            {uploadSection}

            {/* Document Thumbnails */}
            {stageDocuments.length > 0 && (
              <div className="mb-3">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {stageDocuments.slice(0, 4).map((doc) => {
                    const thumbnail = getDocumentThumbnail(doc);
                    return (
                      <div
                        key={doc.id}
                        className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-primary/20 overflow-hidden bg-muted/50 flex items-center justify-center group hover:border-primary/60 transition-all"
                      >
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt={doc.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          />
                        ) : (
                          <FileText className="h-6 w-6 text-primary/40" />
                        )}
                      </div>
                    );
                  })}
                  {stageDocuments.length > 4 && (
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-primary/20 bg-muted/30 flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">+{stageDocuments.length - 4}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Document Count & Actions */}
            <div className="flex items-center justify-between">
              <span className="text-xs px-2 py-1 md:px-3 md:py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {docCount} documents
              </span>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleComplete();
                }}
                variant={isCompleted ? "default" : "outline"}
                size="sm"
                className="text-xs"
              >
                {isCompleted ? "✓ Done" : "Mark Done"}
              </Button>
            </div>

            <p className="text-xs text-muted-foreground/60 mt-1 text-center">
              {isMobile ? 'Tap' : 'Click'} to see details
            </p>
          </div>
        </div>

        {/* Back Side */}
        <div 
          className="absolute inset-0 glass-card p-6 rounded-lg"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="flex flex-col gap-3 h-full">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-base md:text-xs font-bold px-3 py-1.5 md:px-2 md:py-1 rounded-full bg-gradient-to-r ${gradient} text-white`}>
                {number}
              </span>
              <span className="text-xs text-primary/60">Details</span>
            </div>
            
            <h3 className="text-xl font-heading font-bold tracking-tight text-card-foreground mb-2">
              {title}
            </h3>

            <p className="text-xs md:text-sm text-muted-foreground leading-relaxed flex-1 overflow-y-auto">
              {backDetails}
            </p>

            <p className="text-xs text-muted-foreground/60 mt-2 text-center">
              {isMobile ? 'Tap' : 'Click'} to flip back
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
