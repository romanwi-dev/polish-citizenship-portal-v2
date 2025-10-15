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
  Truck
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TimelineStep {
  id: number;
  title: string;
  icon: any;
  description: string;
  stage_keys: string[];
  gradient: string;
  linkText?: string;
  linkType?: 'client' | 'translator' | 'courier';
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    id: 1,
    title: "Document Requirements",
    icon: FileCheck,
    description: "Client gathers required documents",
    stage_keys: ["requirements_defined"],
    gradient: "from-blue-500/20 to-cyan-500/20",
    linkText: "Client Account",
    linkType: "client"
  },
  {
    id: 2,
    title: "Upload Photos",
    icon: Upload,
    description: "High-quality photos to translation folder",
    stage_keys: ["upload_pending", "uploaded"],
    gradient: "from-cyan-500/20 to-teal-500/20",
    linkText: "Upload Portal",
    linkType: "client"
  },
  {
    id: 3,
    title: "OCR Scanning",
    icon: Scan,
    description: "Extract text from documents",
    stage_keys: ["ocr_processing", "ocr_complete"],
    gradient: "from-teal-500/20 to-green-500/20"
  },
  {
    id: 4,
    title: "AI Translation",
    icon: Languages,
    description: "Official template-based translation",
    stage_keys: ["ai_translating", "ai_complete"],
    gradient: "from-green-500/20 to-emerald-500/20"
  },
  {
    id: 5,
    title: "HAC Verification",
    icon: CheckCircle,
    description: "Quality review and approval",
    stage_keys: ["hac_review", "hac_approved"],
    gradient: "from-emerald-500/20 to-lime-500/20"
  },
  {
    id: 6,
    title: "Sworn Translator",
    icon: Award,
    description: "Certification and official seal",
    stage_keys: ["sent_to_translator", "translator_certified"],
    gradient: "from-lime-500/20 to-yellow-500/20",
    linkText: "Translator Portal",
    linkType: "translator"
  },
  {
    id: 7,
    title: "WSC Submission",
    icon: Building,
    description: "Submit to WSC office",
    stage_keys: ["ready_for_submission", "submitted_wsc"],
    gradient: "from-yellow-500/20 to-orange-500/20",
    linkText: "Courier Service",
    linkType: "courier"
  },
  {
    id: 8,
    title: "USC Submission",
    icon: Send,
    description: "Final USC submission",
    stage_keys: ["submitted_usc", "completed"],
    gradient: "from-orange-500/20 to-red-500/20",
    linkText: "Track Delivery",
    linkType: "courier"
  }
];

export const TranslationWorkflowTimeline = () => {
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});

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

  const toggleFlip = (stepId: number) => {
    setFlippedCards(prev => ({ ...prev, [stepId]: !prev[stepId] }));
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
    <div className="relative py-8">
      {/* Timeline Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 hidden lg:block" />

      <div className="space-y-8">
        {TIMELINE_STEPS.map((step, index) => {
          const stageWorkflows = getWorkflowsForStage(step.stage_keys);
          const isFlipped = flippedCards[step.id];
          const Icon = step.icon;
          const isLeft = index % 2 === 0;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8",
                isLeft ? "lg:pr-8" : "lg:pl-8 lg:flex-row-reverse"
              )}
            >
              {/* Step Number Badge - Center on Desktop */}
              <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground font-bold shadow-lg border-4 border-background">
                  {step.id}
                </div>
              </div>

              {/* Card Container */}
              <div 
                className={cn(
                  "perspective-1000",
                  isLeft ? "lg:col-start-1" : "lg:col-start-2"
                )}
              >
                <div
                  className={cn(
                    "relative preserve-3d transition-transform duration-500 cursor-pointer",
                    isFlipped && "rotate-y-180"
                  )}
                  onClick={() => toggleFlip(step.id)}
                >
                  {/* Front of Card */}
                  <Card className={cn(
                    "backface-hidden p-6 bg-gradient-to-br",
                    step.gradient,
                    "border-2 hover:border-primary/50 transition-all"
                  )}>
                    {/* Mobile Step Number */}
                    <div className="flex lg:hidden items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-bold mb-4">
                      {step.id}
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-background/80 backdrop-blur-sm rounded-lg shrink-0">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{step.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="font-semibold">
                            {stageWorkflows.length} {stageWorkflows.length === 1 ? 'Document' : 'Documents'}
                          </Badge>
                          
                          {step.linkText && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLinkClick(step.linkType);
                              }}
                            >
                              {step.linkType === 'client' && <User className="h-4 w-4" />}
                              {step.linkType === 'translator' && <Award className="h-4 w-4" />}
                              {step.linkType === 'courier' && <Truck className="h-4 w-4" />}
                              {step.linkText}
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Back of Card */}
                  <Card className={cn(
                    "absolute inset-0 backface-hidden rotate-y-180 p-6",
                    "bg-card/95 backdrop-blur-sm border-2 border-primary/50"
                  )}>
                    <h4 className="text-lg font-semibold mb-4">Active Documents</h4>
                    
                    {stageWorkflows.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No documents at this stage
                      </p>
                    ) : (
                      <div className="space-y-3 max-h-[200px] overflow-y-auto">
                        {stageWorkflows.slice(0, 5).map((workflow: any) => (
                          <div 
                            key={workflow.id}
                            className="p-3 rounded-lg bg-background/50 border border-border/50"
                          >
                            <p className="font-medium text-sm truncate">
                              {workflow.cases?.client_name}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {workflow.documents?.name}
                            </p>
                            {workflow.ai_confidence && (
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 bg-secondary rounded-full h-1.5">
                                  <div 
                                    className="bg-primary rounded-full h-1.5"
                                    style={{ width: `${workflow.ai_confidence * 100}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium">
                                  {(workflow.ai_confidence * 100).toFixed(0)}%
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                        {stageWorkflows.length > 5 && (
                          <p className="text-xs text-muted-foreground text-center pt-2">
                            +{stageWorkflows.length - 5} more
                          </p>
                        )}
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};
