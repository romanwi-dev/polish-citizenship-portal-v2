import { motion } from "framer-motion";
import { useState } from "react";
import { FileEdit, Send, Mail, Zap, CheckCircle, AlertCircle, Award, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { WORKFLOW_CARD_STANDARDS as STANDARDS } from "../workflows/workflow-card-standards";

const citizenshipSteps = [
  {
    number: "01",
    title: "Application Drafting",
    description: "AI generates citizenship application (OBY) using official templates and client data from master form.",
    icon: FileEdit,
    gradient: "from-primary to-secondary",
    cta: "Draft Application",
  },
  {
    number: "02",
    title: "HAC Review",
    description: "Human attorney carefully reviews OBY draft for accuracy, completeness, and legal compliance.",
    icon: Award,
    gradient: "from-secondary to-accent",
    cta: "Review Status",
  },
  {
    number: "03",
    title: "Submit to WSC",
    description: "Official submission of citizenship application to Masovian Voivoda office (WSC).",
    icon: Send,
    gradient: "from-accent to-primary",
    cta: "Track Submission",
  },
  {
    number: "04",
    title: "Awaiting Response",
    description: "Waiting 10-18 months for initial response from WSC with document demands or questions.",
    icon: Clock,
    gradient: "from-primary to-secondary",
    cta: "Check Timeline",
  },
  {
    number: "05",
    title: "WSC Letter Received",
    description: "Initial response letter from WSC analyzed via OCR, deadlines extracted, strategy prepared.",
    icon: Mail,
    gradient: "from-secondary to-accent",
    cta: "View Letter",
  },
  {
    number: "06",
    title: "Document Filing",
    description: "Submit additional evidence, family information, and translations demanded by WSC.",
    icon: FileEdit,
    gradient: "from-accent to-primary",
    cta: "File Documents",
  },
  {
    number: "07",
    title: "Push Schemes",
    description: "Strategic PUSH, NUDGE, or SITDOWN interventions to accelerate case processing.",
    icon: Zap,
    gradient: "from-primary to-secondary",
    cta: "Apply Push",
  },
  {
    number: "08",
    title: "Decision Received",
    description: "Final citizenship confirmation decision received from WSC - case completed successfully!",
    icon: CheckCircle,
    gradient: "from-secondary to-accent",
    cta: "View Decision",
  },
];

export default function CitizenshipWorkflowCards() {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (stepNumber: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  return (
    <section className="relative py-16 overflow-hidden">
      <div className="container relative z-10 mx-auto px-4">
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
              Citizenship Workflow
            </span>
          </motion.h2>
        </motion.div>

        <div className="relative max-w-6xl mx-auto">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 hidden md:block" />

          {citizenshipSteps.map((step, index) => {
            const isLeft = index % 2 === 0;
            
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                className={`mb-16 last:mb-0 flex flex-col md:${isLeft ? 'flex-row' : 'flex-row-reverse'} gap-4 md:gap-12 items-stretch`}
              >
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
                      <motion.div
                        whileHover={{ scale: 1.03, y: -5 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0 glass-card p-8 rounded-lg hover-glow group flex flex-col"
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                        }}
                      >
                        <div className="mb-6 relative">
                          <div className="w-full h-32 rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
                            <step.icon className="w-16 h-16 text-primary opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>
                          <div className={`absolute top-4 left-4 text-5xl font-heading font-black bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent opacity-20`}>
                            {step.number}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center space-y-6">
                          <h3 className="text-2xl md:text-3xl font-heading font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
                            {step.title}
                          </h3>
                          <p className="text-xs text-muted-foreground/70 leading-relaxed text-center px-4">
                            {step.description}
                          </p>
                        </div>
                        
                        <div className="mt-6">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {step.cta}
                          </Button>
                        </div>
                      </motion.div>

                      <div 
                        className="absolute inset-0 glass-card p-8 rounded-lg hover-glow flex flex-col items-center justify-center"
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                        }}
                      >
                        <div className="flex flex-col items-center gap-6 h-full justify-center max-w-md">
                          <div className="relative">
                            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-secondary/5 to-accent/5 flex items-center justify-center">
                              <step.icon className="w-12 h-12 text-secondary opacity-60" />
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-heading font-bold tracking-tight text-card-foreground text-center">
                            Stage Details
                          </h3>
                          <div className="space-y-3 w-full">
                            <div className="p-4 rounded-lg bg-muted/30 text-center">
                              <p className="text-sm text-muted-foreground">
                                Critical citizenship application stage
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex md:w-[16%] flex-shrink-0 justify-center relative z-10">
                  <div className="w-8 h-8 rounded-full bg-primary border-4 border-background shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300" />
                </div>

                <div className="hidden md:block md:w-[42%]" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}