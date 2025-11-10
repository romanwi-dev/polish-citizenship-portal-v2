import { motion } from "framer-motion";
import { useState } from "react";
import { Archive, FileSearch, Send, Award, CheckCircle, Clock, Users, Building2 } from "lucide-react";
import { Button } from "../ui/button";
import { WORKFLOW_CARD_STANDARDS as STANDARDS } from "../workflows/workflow-card-standards";

const archivesSteps = [
  {
    number: "01",
    title: "Archives Identification",
    description: "Identify which Polish and international archives likely hold documents for the client's ancestors.",
    icon: Archive,
    gradient: "from-primary to-secondary",
    cta: "View Archives",
  },
  {
    number: "02",
    title: "Request Preparation",
    description: "Prepare official archive requests in Polish using proper templates and genealogical data.",
    icon: FileSearch,
    gradient: "from-secondary to-accent",
    cta: "Prepare Requests",
  },
  {
    number: "03",
    title: "Submit to Archives",
    description: "Submit requests to Polish archives (USC, State Archives) and international archives.",
    icon: Send,
    gradient: "from-accent to-primary",
    cta: "Track Submissions",
  },
  {
    number: "04",
    title: "Partner Coordination",
    description: "Coordinate with local genealogy partners who have direct archive access and contacts.",
    icon: Users,
    gradient: "from-primary to-secondary",
    cta: "View Partners",
  },
  {
    number: "05",
    title: "Awaiting Response",
    description: "Monitor archive responses and follow up on delayed or incomplete replies.",
    icon: Clock,
    gradient: "from-secondary to-accent",
    cta: "Check Status",
  },
  {
    number: "06",
    title: "Document Verification",
    description: "Verify received documents for authenticity and completeness, identify missing pieces.",
    icon: Award,
    gradient: "from-accent to-primary",
    cta: "Verify Documents",
  },
  {
    number: "07",
    title: "USC Workflow",
    description: "Process umiejscowienie (localization) and uzupełnienie (completion) with Polish Civil Registry.",
    icon: Building2,
    gradient: "from-primary to-secondary",
    cta: "USC Tracking",
  },
  {
    number: "08",
    title: "Documents Ready",
    description: "Archive documents authenticated and ready for translation and submission.",
    icon: CheckCircle,
    gradient: "from-secondary to-accent",
    cta: "View Results",
  },
];

export default function ArchivesWorkflowCards() {
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
              Research Workflow
            </span>
          </motion.h2>
        </motion.div>

        {/* Steps - Left-Right Alternating Layout */}
        <div className="relative max-w-6xl mx-auto">
          {/* Center line for desktop */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 hidden md:block" />

          {archivesSteps.map((step, index) => {
            const isLeft = index % 2 === 0;
            
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
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
                        </div>

                        <div className="flex-1 flex flex-col justify-center space-y-6">
                          <h3 className="text-2xl md:text-3xl font-heading font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-center">
                            {step.title}
                          </h3>
                          <p className="text-xs text-muted-foreground/70 leading-relaxed text-center px-4">
                            {step.description}
                          </p>
                        </div>
                        
                        <div className="mt-6 space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {step.cta}
                          </Button>
                          <p className="text-xs text-muted-foreground/60 text-center">Tap to see details</p>
                        </div>
                      </motion.div>

                      {/* Back Side */}
                      <div 
                        className="absolute inset-0 glass-card p-8 rounded-lg hover-glow flex flex-col"
                        style={{
                          backfaceVisibility: 'hidden',
                          WebkitBackfaceVisibility: 'hidden',
                          transform: 'rotateY(180deg)',
                        }}
                      >
                        <div className="mb-4 relative">
                          <div className="w-full h-32 rounded-lg overflow-hidden bg-gradient-to-br from-secondary/5 to-accent/5 flex items-center justify-center">
                            <step.icon className="w-16 h-16 text-secondary opacity-60" />
                          </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col gap-4">
                          <h3 className="text-xl font-heading font-bold tracking-tight text-card-foreground">
                            Stage Details
                          </h3>
                          <div className="flex-1 overflow-auto space-y-3">
                            <div className="p-3 rounded-lg bg-muted/30">
                              <p className="text-sm text-muted-foreground">
                                Archive search stage for comprehensive document recovery
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground/60 text-center mt-4">Tap to flip back</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex md:w-[16%] flex-shrink-0 justify-center relative z-10">
                  <div className="w-12 h-12 rounded-full bg-primary border-4 border-background shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-300 flex items-center justify-center">
                    <span className="text-white font-heading font-bold text-lg">{step.number}</span>
                  </div>
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