import { motion } from "framer-motion";
import { useState } from "react";
import { Languages, Upload, ScanText, Bot, UserCheck, Award, FileCheck, Send } from "lucide-react";
import { Button } from "../ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const translationSteps = [
  {
    number: "01",
    title: "Document Requirements",
    description: "Prepare comprehensive list of all documents that client needs to gather for the citizenship case.",
    icon: FileCheck,
    gradient: "from-primary to-secondary",
    stage: "requirements_set",
    cta: "View Requirements",
  },
  {
    number: "02",
    title: "Translation Check",
    description: "Review which documents must be translated to Polish and certified by a Polish Sworn Translator.",
    icon: Languages,
    gradient: "from-secondary to-accent",
    stage: "translation_identified",
    cta: "Review Documents",
  },
  {
    number: "03",
    title: "Client Upload",
    description: "Client uploads high-quality photos of documents to their dedicated translation folder on the portal.",
    icon: Upload,
    gradient: "from-accent to-primary",
    stage: "upload_pending",
    cta: "Upload Portal",
  },
  {
    number: "04",
    title: "OCR Scanning",
    description: "AI-powered OCR system scans and digitizes all uploaded documents for processing.",
    icon: ScanText,
    gradient: "from-primary to-secondary",
    stage: "ocr_processing",
    cta: "View OCR Results",
  },
  {
    number: "05",
    title: "AI Translation",
    description: "Documents are translated using official templates with AI assistance for accuracy and consistency.",
    icon: Bot,
    gradient: "from-secondary to-accent",
    stage: "ai_translating",
    cta: "View Translations",
  },
  {
    number: "06",
    title: "HAC Verification",
    description: "Human attorney carefully reviews all AI translations for accuracy, completeness, and legal compliance.",
    icon: UserCheck,
    gradient: "from-accent to-primary",
    stage: "hac_review",
    cta: "HAC Dashboard",
  },
  {
    number: "07",
    title: "Sworn Translator",
    description: "Original documents and translations sent to Polish Sworn Translator for review, correction, certification, and official seal.",
    icon: Award,
    gradient: "from-primary to-secondary",
    stage: "sent_to_translator",
    cta: "Translator Portal",
  },
  {
    number: "08",
    title: "WSC/USC Submission",
    description: "Certified documents prepared and submitted to Polish authorities (WSC/USC) for official processing.",
    icon: Send,
    gradient: "from-secondary to-accent",
    stage: "submitted",
    cta: "Track Submission",
  },
];

interface TranslationWorkflowCardsProps {
  caseId?: string;
}

export default function TranslationWorkflowCards({ caseId }: TranslationWorkflowCardsProps) {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (stepNumber: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  // Fetch workflow statistics for each stage
  const { data: workflowStats } = useQuery({
    queryKey: ['translation-workflow-stats', caseId],
    queryFn: async () => {
      let query = supabase
        .from('translation_workflows' as any)
        .select('stage, id, case_id, document_name, ai_confidence');

      if (caseId) {
        query = query.eq('case_id', caseId);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Count documents in each stage
      const stageCounts = translationSteps.reduce((acc, step) => {
        const count = data?.filter((d: any) => d.stage === step.stage).length || 0;
        acc[step.stage] = count;
        return acc;
      }, {} as Record<string, number>);

      return stageCounts;
    }
  });

  return (
    <section className="relative py-16 overflow-hidden">
      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-24"
        >
          <motion.h2
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              duration: 2.5, 
              delay: 0.2,
              type: "spring",
              stiffness: 50,
              damping: 15
            }}
            viewport={{ once: true }}
            className="text-4xl md:text-7xl font-heading font-black mb-8 tracking-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-fade-in-up glow-text drop-shadow-2xl">
              Translation Workflow
            </span>
          </motion.h2>
        </motion.div>

        {/* Steps - Left-Right Alternating Layout */}
        <div className="relative max-w-6xl mx-auto">
          {/* Center line for desktop */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 hidden md:block -z-10" />

          {translationSteps.map((step, index) => {
            const isLeft = index % 2 === 0;
            const documentCount = workflowStats?.[step.stage] || 0;
            
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.15, 
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                viewport={{ once: true, margin: "-50px" }}
                className="mb-16 last:mb-0"
              >
                <div className={`flex flex-col md:${isLeft ? 'flex-row' : 'flex-row-reverse'} gap-4 md:gap-16 items-center`}>
                  {/* Card */}
                  <div className="w-full md:w-[42%]">
                    <div 
                      className="relative h-[520px]"
                      style={{ perspective: '1000px' }}
                    >
                    <div
                      onClick={() => toggleFlip(step.number)}
                      className="absolute inset-0 cursor-pointer transition-transform duration-700"
                      style={{
                        transformStyle: 'preserve-3d',
                        transform: flippedCards[step.number] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                      }}
                    >
                      {/* Front Side */}
                      <motion.div
                        whileHover={{ scale: 1.02, y: -3 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute inset-0 glass-card p-8 rounded-lg hover-glow group flex flex-col"
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                        }}
                      >
                        <div className="mb-6 relative flex items-center justify-center">
                          <div className="w-full h-32 rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
                            <step.icon className="w-16 h-16 text-primary opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          {documentCount > 0 && (
                            <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
                              {documentCount}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col justify-center space-y-6">
                          <h3 className="text-2xl md:text-3xl font-heading font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
                            {step.title}
                          </h3>
                          <p className="text-xs text-muted-foreground/70 leading-relaxed text-center px-4">
                            {step.description}
                          </p>
                        </div>
                        
                        <div className="mt-auto mb-6 space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {step.cta}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground/60 text-center">Tap to see details</p>
                      </motion.div>

                      {/* Back Side */}
                      <div 
                        className="absolute inset-0 glass-card p-8 rounded-lg hover-glow flex flex-col items-center justify-center"
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                        }}
                      >
                        <div className="flex flex-col h-full w-full max-w-md">
                          <div className="relative mb-6">
                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-secondary/5 to-accent/5 flex items-center justify-center mx-auto">
                              <step.icon className="w-12 h-12 text-secondary opacity-60" />
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-heading font-bold tracking-tight text-card-foreground text-center mb-4">
                            Stage Details
                          </h3>
                          
                          <div className="flex-1 space-y-3 w-full overflow-auto">
                            <div className="p-4 rounded-lg bg-muted/30 text-center">
                              <p className="text-sm font-medium mb-1">Documents in this stage:</p>
                              <p className="text-2xl font-bold text-primary">{documentCount}</p>
                            </div>
                            <div className="p-4 rounded-lg bg-muted/30 text-center">
                              <p className="text-sm text-muted-foreground">
                                {step.stage === 'requirements_set' && 'Set up document requirements for each case and family member.'}
                                {step.stage === 'translation_identified' && 'Identify which documents require Polish translation.'}
                                {step.stage === 'upload_pending' && 'Awaiting client to upload document scans to their portal.'}
                                {step.stage === 'ocr_processing' && 'AI scanning and extracting text from uploaded documents.'}
                                {step.stage === 'ai_translating' && 'AI generating translations using official templates.'}
                                {step.stage === 'hac_review' && 'Attorney reviewing translations for accuracy and compliance.'}
                                {step.stage === 'sent_to_translator' && 'Documents sent to certified Polish translator for official certification.'}
                                {step.stage === 'submitted' && 'Certified documents submitted to Polish authorities for processing.'}
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground/60 text-center mt-4">Tap to flip back</p>
                        </div>
                      </div>
                    </div>
                    </div>
                  </div>

                  {/* Timeline Dot */}
                  <div className="hidden md:flex md:w-[16%] flex-shrink-0 justify-center relative z-10 items-center">
                    <div className="w-16 h-16 rounded-full glass-card bg-background/95 backdrop-blur-xl border border-border/50 shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-all duration-300 flex items-center justify-center">
                      <span className="text-muted-foreground/50 font-heading font-bold text-3xl">{step.number}</span>
                    </div>
                  </div>

                  {/* Empty space on other side */}
                  <div className="hidden md:block md:w-[42%]" />
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
