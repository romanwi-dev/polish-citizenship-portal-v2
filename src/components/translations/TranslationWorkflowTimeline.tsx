import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { 
  Upload, 
  Scan, 
  Languages, 
  CheckCircle, 
  Award,
  FileCheck,
  Building,
  Send,
  ExternalLink,
  User,
  Truck,
  Clock,
  Shield
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TimelineStep {
  number: string;
  title: string;
  icon: any;
  description: string;
  stage_keys: string[];
  gradient: string;
  duration: string;
  priority: string;
  linkText?: string;
  linkType?: 'client' | 'translator' | 'courier';
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    number: "1",
    title: "DOCUMENT REQUIREMENTS",
    icon: FileCheck,
    description: "Client gathers all required documents for translation",
    stage_keys: ["requirements_defined"],
    gradient: "from-blue-500 to-cyan-500",
    duration: "Day 1",
    priority: "Foundation",
    linkText: "Client Account",
    linkType: "client"
  },
  {
    number: "2",
    title: "UPLOAD PHOTOS",
    icon: Upload,
    description: "High-quality photos uploaded to translation folder",
    stage_keys: ["upload_pending", "uploaded"],
    gradient: "from-cyan-500 to-teal-500",
    duration: "Day 1-3",
    priority: "Client Action",
    linkText: "Upload Portal",
    linkType: "client"
  },
  {
    number: "3",
    title: "OCR SCANNING",
    icon: Scan,
    description: "Automated text extraction from document images",
    stage_keys: ["ocr_processing", "ocr_complete"],
    gradient: "from-teal-500 to-green-500",
    duration: "Day 3-4",
    priority: "Processing"
  },
  {
    number: "4",
    title: "AI TRANSLATION",
    icon: Languages,
    description: "Professional translation using official Polish templates",
    stage_keys: ["ai_translating", "ai_complete"],
    gradient: "from-green-500 to-emerald-500",
    duration: "Day 4-6",
    priority: "Core Service"
  },
  {
    number: "5",
    title: "HAC VERIFICATION",
    icon: CheckCircle,
    description: "Expert review and quality approval",
    stage_keys: ["hac_review", "hac_approved"],
    gradient: "from-emerald-500 to-lime-500",
    duration: "Day 6-8",
    priority: "Quality Control"
  },
  {
    number: "6",
    title: "SWORN TRANSLATOR",
    icon: Award,
    description: "Official certification with sworn translator seal",
    stage_keys: ["sent_to_translator", "translator_certified"],
    gradient: "from-lime-500 to-yellow-500",
    duration: "Day 8-12",
    priority: "Major Milestone",
    linkText: "Translator Portal",
    linkType: "translator"
  },
  {
    number: "7",
    title: "WSC SUBMISSION",
    icon: Building,
    description: "Prepared documents submitted to WSC office",
    stage_keys: ["ready_for_submission", "submitted_wsc"],
    gradient: "from-yellow-500 to-orange-500",
    duration: "Day 12-14",
    priority: "Submission",
    linkText: "Courier Service",
    linkType: "courier"
  },
  {
    number: "8",
    title: "USC SUBMISSION",
    icon: Send,
    description: "Final submission to USC office completed",
    stage_keys: ["submitted_usc", "completed"],
    gradient: "from-orange-500 to-red-500",
    duration: "Day 14-16",
    priority: "Final Step",
    linkText: "Track Delivery",
    linkType: "courier"
  }
];

export const TranslationWorkflowTimeline = () => {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  const { data: workflows, isLoading } = useQuery({
    queryKey: ["translation-workflows-timeline"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("translation_workflows" as any)
        .select(`
          *,
          cases!inner(id, client_name, client_code),
          documents(name, type),
          sworn_translators(full_name, certification_number)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  const toggleFlip = (stepNumber: string) => {
    setFlippedCards(prev => ({ ...prev, [stepNumber]: !prev[stepNumber] }));
  };

  const getWorkflowsForStage = (stageKeys: string[]) => {
    return workflows?.filter((w: any) => stageKeys.includes(w.stage)) || [];
  };

  const handleLinkClick = (linkType?: string) => {
    if (linkType === 'client') {
      // Navigate to client portal
    } else if (linkType === 'translator') {
      // Navigate to translator section
    } else if (linkType === 'courier') {
      // Navigate to courier tracking
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Languages className="h-8 w-8 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <section className="relative py-12 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div 
        className="absolute inset-0" 
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary) / 0.1) 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }} 
      />
      
      <div className="container relative z-10 mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Translation Workflow</span>
          </div>
          <motion.h2
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 2.5,
              delay: 0.3,
              type: "spring",
              stiffness: 40,
              damping: 20
            }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-heading font-black mb-6 tracking-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-fade-in-up glow-text drop-shadow-2xl">
              Complete Translation Process
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8"
          >
            Professional document translation with AI precision, HAC verification, and sworn translator certification
          </motion.p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Center line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 hidden md:block" />

          {TIMELINE_STEPS.map((step, index) => {
            const stageWorkflows = getWorkflowsForStage(step.stage_keys);
            const isFlipped = flippedCards[step.number];
            const Icon = step.icon;

            return (
              <motion.div
                key={step.number}
                initial={prefersReducedMotion ? {} : {
                  opacity: 0,
                  x: index % 2 === 0 ? -50 : 50
                }}
                whileInView={prefersReducedMotion ? {} : {
                  opacity: 1,
                  x: 0
                }}
                transition={prefersReducedMotion ? {} : {
                  duration: 0.6,
                  delay: index * 0.1
                }}
                viewport={{
                  once: true,
                  margin: "-100px"
                }}
                className={`relative mb-12 md:mb-16 flex flex-col md:flex-row items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* Content Card */}
                <div className="w-full md:w-5/12">
                  <div 
                    className="relative h-[280px] md:h-[360px]" 
                    style={{ perspective: '1000px' }}
                  >
                    <div 
                      onClick={() => toggleFlip(step.number)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleFlip(step.number);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`${step.title} - ${isMobile ? 'Tap' : 'Click'} to view details`}
                      className="absolute inset-0 cursor-pointer transition-transform duration-700 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg" 
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                      }}
                    >
                      {/* Front Side */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 glass-card p-6 rounded-lg hover-glow group"
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden'
                        }}
                      >
                        <div className="flex flex-col gap-3 h-full">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-sm md:text-xs font-bold px-3 py-1.5 md:px-2 md:py-1 rounded-full bg-gradient-to-r ${step.gradient} text-white`}>
                              {step.number}
                            </span>
                            <span className="text-[10px] md:text-xs text-muted-foreground">{step.duration}</span>
                          </div>
                          <motion.h3
                            initial={prefersReducedMotion ? {} : {
                              opacity: 0,
                              x: -20,
                              scale: 0.95
                            }}
                            whileInView={prefersReducedMotion ? {} : {
                              opacity: 1,
                              x: 0,
                              scale: 1
                            }}
                            transition={prefersReducedMotion ? {} : {
                              duration: 2,
                              delay: index * 0.08,
                              type: "spring",
                              stiffness: 60,
                              damping: 15
                            }}
                            viewport={{ once: true }}
                            className="text-xl md:text-2xl lg:text-3xl font-heading font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-110 transition-all duration-300 drop-shadow-lg"
                          >
                            {step.title}
                          </motion.h3>
                          <p className="text-xs md:text-sm text-muted-foreground mb-3 flex-1 line-clamp-3 md:line-clamp-none">
                            {step.description}
                          </p>
                          <div className="flex flex-wrap gap-1.5 md:gap-2 items-center">
                            <span className="text-[10px] md:text-xs px-2 py-1 md:px-3 md:py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                              {step.priority}
                            </span>
                            <Badge variant="secondary" className="font-semibold">
                              {stageWorkflows.length} {stageWorkflows.length === 1 ? 'Doc' : 'Docs'}
                            </Badge>
                            {step.linkText && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-1 h-auto px-2 py-1 text-[10px] md:text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleLinkClick(step.linkType);
                                }}
                              >
                                {step.linkType === 'client' && <User className="h-3 w-3" />}
                                {step.linkType === 'translator' && <Award className="h-3 w-3" />}
                                {step.linkType === 'courier' && <Truck className="h-3 w-3" />}
                                <span className="hidden md:inline">{step.linkText}</span>
                                <ExternalLink className="h-2 w-2" />
                              </Button>
                            )}
                          </div>
                          <p className="text-[10px] md:text-xs text-muted-foreground/60 mt-2 text-center">
                            {isMobile ? 'Tap' : 'Click'} to see details
                          </p>
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
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-base md:text-xs font-bold px-3 py-1.5 md:px-2 md:py-1 rounded-full bg-gradient-to-r ${step.gradient} text-white`}>
                              {step.number}
                            </span>
                            <span className="text-xs text-primary/60">Active Documents</span>
                          </div>
                          <h3 className="text-lg font-heading font-bold tracking-tight text-card-foreground mb-2">
                            Documents in Progress
                          </h3>
                          {stageWorkflows.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8 flex-1 flex items-center justify-center">
                              No documents at this stage
                            </p>
                          ) : (
                            <div className="space-y-2 max-h-[220px] overflow-y-auto flex-1">
                              {stageWorkflows.slice(0, 5).map((workflow: any) => (
                                <div 
                                  key={workflow.id}
                                  className="p-2 rounded-lg bg-background/50 border border-border/50"
                                >
                                  <p className="font-medium text-xs truncate">
                                    {workflow.cases?.client_name}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground truncate">
                                    {workflow.documents?.name}
                                  </p>
                                  {workflow.ai_confidence && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex-1 bg-secondary rounded-full h-1">
                                        <div 
                                          className="bg-primary rounded-full h-1"
                                          style={{ width: `${workflow.ai_confidence * 100}%` }}
                                        />
                                      </div>
                                      <span className="text-[10px] font-medium">
                                        {(workflow.ai_confidence * 100).toFixed(0)}%
                                      </span>
                                    </div>
                                  )}
                                </div>
                              ))}
                              {stageWorkflows.length > 5 && (
                                <p className="text-[10px] text-muted-foreground text-center pt-1">
                                  +{stageWorkflows.length - 5} more
                                </p>
                              )}
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground/60 text-center mt-2">
                            {isMobile ? 'Tap' : 'Click'} to flip back
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center Circle with Number */}
                <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1 + 0.2
                    }}
                    viewport={{ once: true }}
                    className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary p-1 animate-float"
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                      <span className="text-4xl font-heading font-black bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                        {step.number}
                      </span>
                    </div>
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-xl -z-10" />
                  </motion.div>
                </div>

                {/* Empty space for layout balance */}
                <div className="w-full md:w-5/12 hidden md:block" />
              </motion.div>
            );
          })}
        </div>

        {/* Expert Tip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 glass-card p-6 md:p-8 rounded-lg max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-card-foreground">Professional Translation Service</h3>
          </div>
          <p className="text-muted-foreground text-left w-full">
            Every document is handled with precision. Our AI-powered translation system uses official Polish templates, 
            followed by expert HAC verification and sworn translator certification. This ensures your documents meet 
            all legal requirements for WSC and USC submissions.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
