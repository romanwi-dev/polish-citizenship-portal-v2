import { motion } from "framer-motion";
import { useState } from "react";
import { FileText, Send, Clock, CheckCircle, Building2, Award, CreditCard, UserCheck } from "lucide-react";
import { Button } from "../ui/button";

const civilActsSteps = [
  {
    number: "01",
    title: "Application Prep",
    description: "Prepare Polish civil registry applications for birth/marriage certificates needed for citizenship case.",
    icon: FileText,
    gradient: "from-primary to-secondary",
    cta: "Prepare Application",
  },
  {
    number: "02",
    title: "Payment Processing",
    description: "Process payment for civil acts application fees and our service charge.",
    icon: CreditCard,
    gradient: "from-secondary to-accent",
    cta: "Process Payment",
  },
  {
    number: "03",
    title: "Submit to USC",
    description: "Submit application to relevant Polish Civil Registry office (USC) for processing.",
    icon: Send,
    gradient: "from-accent to-primary",
    cta: "Track Submission",
  },
  {
    number: "04",
    title: "USC Processing",
    description: "USC processes application, verifies information, and prepares official certificates.",
    icon: Building2,
    gradient: "from-primary to-secondary",
    cta: "Check Status",
  },
  {
    number: "05",
    title: "Awaiting Response",
    description: "Monitoring USC response time and following up on delayed applications.",
    icon: Clock,
    gradient: "from-secondary to-accent",
    cta: "View Timeline",
  },
  {
    number: "06",
    title: "Agent Verification",
    description: "Civil Acts Agent verifies received certificates for accuracy and completeness.",
    icon: UserCheck,
    gradient: "from-accent to-primary",
    cta: "Agent Dashboard",
  },
  {
    number: "07",
    title: "Certificate Review",
    description: "Review Polish birth/marriage certificates for legal accuracy and required details.",
    icon: Award,
    gradient: "from-primary to-secondary",
    cta: "Review Certificate",
  },
  {
    number: "08",
    title: "Ready for Case",
    description: "Certified Polish civil acts received and ready to include in citizenship case.",
    icon: CheckCircle,
    gradient: "from-secondary to-accent",
    cta: "Add to Case",
  },
];

export default function CivilActsWorkflowCards() {
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
              Civil Acts Workflow
            </span>
          </motion.h2>
        </motion.div>

        <div className="relative max-w-6xl mx-auto">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 hidden md:block" />

          {civilActsSteps.map((step, index) => {
            const isLeft = index % 2 === 0;
            
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-50px" }}
                className={`mb-12 md:flex ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center gap-8`}
              >
                <div className={`md:w-5/12 ${isLeft ? 'md:text-right' : 'md:text-left'}`}>
                  <div 
                    className="relative h-[400px]"
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
                        className="absolute inset-0 glass-card p-8 rounded-lg hover-glow group"
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

                        <div className="space-y-4">
                          <h3 className="text-2xl md:text-3xl font-heading font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {step.title}
                          </h3>
                          <p className="text-muted-foreground leading-relaxed mb-4">
                            {step.description}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {step.cta}
                          </Button>
                          <p className="text-xs text-muted-foreground/60 text-center mt-2">Tap card for details</p>
                        </div>
                      </motion.div>

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
                              <step.icon className="w-16 h-16 text-secondary opacity-60" />
                            </div>
                          </div>
                          
                          <h3 className="text-xl font-heading font-bold tracking-tight text-card-foreground mb-2">
                            Stage Details
                          </h3>
                          <div className="flex-1 overflow-auto space-y-3">
                            <div className="p-3 rounded-lg bg-muted/30">
                              <p className="text-sm text-muted-foreground">
                                Polish civil registry certificate procurement stage
                              </p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground/60 text-center">Tap to flip back</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden md:block w-2/12 flex-shrink-0 relative">
                  <div className="w-8 h-8 rounded-full bg-primary border-4 border-background mx-auto relative z-10" />
                </div>

                <div className="hidden md:block md:w-5/12" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}