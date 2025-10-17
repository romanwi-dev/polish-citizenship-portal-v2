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
          className="text-center mb-16"
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
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8"
          >
            Smart step-by-step human and AI supervised process from document collection to official submission
          </motion.p>
        </motion.div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {translationSteps.map((step, index) => {
            const documentCount = workflowStats?.[step.stage] || 0;
            
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <div 
                  className="relative h-[450px]"
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
                      whileHover={{ scale: 1.03, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-0 glass-card p-8 rounded-lg hover-glow group"
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                      }}
                    >
                      {/* Number */}
                      <div className="mb-6 relative">
                        <div className="w-full h-32 rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
                          <div className={`text-6xl font-heading font-black bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}>
                            {step.number}
                          </div>
                        </div>
                        {documentCount > 0 && (
                          <div className="absolute top-4 right-4 bg-primary text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm">
                            {documentCount}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="space-y-4">
                        <motion.h3 
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          viewport={{ once: true }}
                          className="text-2xl md:text-3xl font-heading font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300"
                        >
                          {step.title}
                        </motion.h3>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                          {step.description}
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {step.cta} →
                        </Button>
                        <p className="text-xs text-muted-foreground/60 text-center mt-2">Tap card for details</p>
                      </div>
                    </motion.div>

                    {/* Back Side */}
                    <div 
                      className="absolute inset-0 glass-card p-8 rounded-lg hover-glow"
                      style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      <div className="flex flex-col gap-4 h-full">
                        <div className="mb-4 relative">
                          <div className="w-full h-32 rounded-lg overflow-hidden bg-gradient-to-br from-secondary/5 to-accent/5 flex items-center justify-center">
                            <div className={`text-6xl font-heading font-black bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent`}>
                              {step.number}
                            </div>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-heading font-bold tracking-tight text-card-foreground mb-2">
                          Stage Details
                        </h3>
                        <div className="flex-1 overflow-auto space-y-3">
                          <div className="p-3 rounded-lg bg-muted/30">
                            <p className="text-sm font-medium mb-1">Documents in this stage:</p>
                            <p className="text-2xl font-bold text-primary">{documentCount}</p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/30">
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
                        <p className="text-xs text-muted-foreground/60 text-center">Tap to flip back</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <Button
            size="lg"
            className="text-xl md:text-2xl font-bold px-8 md:px-20 py-6 h-auto rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow group relative overflow-hidden backdrop-blur-md border border-white/30 w-full md:w-auto"
          >
            <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              View All Translation Jobs
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
