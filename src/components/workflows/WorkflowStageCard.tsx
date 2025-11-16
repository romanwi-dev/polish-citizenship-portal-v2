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
      className="relative h-[480px]"
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
            "absolute inset-0 w-full h-[480px] glass-card p-6 rounded-lg transition-all duration-300 flex flex-col",
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
          {/* Header */}
          <div className="flex items-center justify-center gap-2 mb-4">
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
            "mb-6 flex h-32 items-center justify-center rounded-lg w-full",
            isCompleted 
              ? "bg-green-500/10" 
              : "bg-gradient-to-br from-primary/5 to-secondary/5"
          )}>
            <Icon className={cn(
              "h-16 w-16",
              isCompleted ? "text-green-500" : "text-primary opacity-80"
            )} />
          </div>

          {/* Content - Centered */}
          <div className="flex-1 flex flex-col justify-center space-y-4">
            <h3 className={cn(
              "text-2xl md:text-3xl font-heading font-black tracking-tight bg-clip-text text-transparent text-center",
              isCompleted 
                ? "bg-gradient-to-r from-green-500 to-green-600" 
                : "bg-gradient-to-r from-primary to-secondary"
            )}>
              {title}
            </h3>

            <p className="text-xs text-muted-foreground/70 leading-relaxed text-center px-4">
              {description}
            </p>
          </div>

          {/* Upload Section */}
          {uploadSection && (
            <div className="mb-3">
              {uploadSection}
            </div>
          )}

          {/* Document Thumbnails */}
          {stageDocuments.length > 0 && (
            <div className="mb-3">
              <div className="flex gap-2 overflow-x-auto pb-2 justify-center">
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
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                {docCount} documents
              </span>
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onToggleComplete();
              }}
              variant={isCompleted ? "default" : "outline"}
              size="sm"
              className="w-full"
            >
              {isCompleted ? "✓ Done" : "Mark Done"}
            </Button>
            <p className="text-xs text-muted-foreground/60 text-center">
              {isMobile ? 'Tap' : 'Click'} to see details
            </p>
          </div>
        </div>

        {/* Back Side */}
        <div 
          className="absolute inset-0 w-full h-[480px] glass-card p-8 rounded-lg flex flex-col"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="mb-6 relative">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-secondary/5 to-accent/5 flex items-center justify-center mx-auto">
              <Icon className="w-12 h-12 text-secondary opacity-60" />
            </div>
          </div>
          
          <h3 className="text-xl font-heading font-bold tracking-tight text-card-foreground text-center mb-4">
            {title} - Details
          </h3>

          <div className="flex-1 overflow-y-auto">
            <p className="text-sm text-muted-foreground leading-relaxed text-center">
              {backDetails}
            </p>
          </div>

          <p className="text-xs text-muted-foreground/60 text-center mt-4">
            {isMobile ? 'Tap' : 'Click'} to flip back
          </p>
        </div>
      </div>
    </div>
  );
}
