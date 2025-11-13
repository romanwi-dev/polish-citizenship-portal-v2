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
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 hidden md:block" />
            
            {citizenshipSteps.map((step, index) => {
              const isLeft = index % 2 === 0;
              
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.05 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className={`relative flex ${isLeft ? 'md:flex-row' : 'md:flex-row-reverse'} items-center mb-16 last:mb-0`}
                >
                  {/* Card */}
                  <div className="w-full md:w-[45%]">
                    <div 
                      className="relative h-[400px] animate-fade-in"
                      style={{ 
                        animationDelay: `${(index + 1) * 100}ms`,
                        perspective: '1000px'
                      }}
                    >
                      <div
                        onClick={() => toggleFlip(step.number)}
                        className="relative w-full h-full cursor-pointer transition-transform duration-700"
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: flippedCards[step.number] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        }}
                      >
                        {/* Front Side */}
                        <div
                          className="absolute inset-0 glass-card p-8 rounded-xl hover-glow group transition-all duration-300 hover:scale-[1.02]"
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                          }}
                        >
                          {/* Icon */}
                          <div className="mb-6 relative">
                            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.gradient} opacity-20 absolute top-0 left-0 group-hover:opacity-30 transition-opacity duration-300`} />
                            <step.icon className="w-12 h-12 text-primary relative z-10" />
                          </div>

                          {/* Content */}
                          <div className="space-y-4">
                            <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                              {step.title}
                            </h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {step.description}
                            </p>
                          </div>

                          {/* CTA Button */}
                          <div className="mt-6">
                            <Button
                              variant="outline"
                              className={`w-full border-2 bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent hover:bg-primary/10 transition-all duration-300`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              {step.cta}
                            </Button>
                          </div>
                        </div>

                        {/* Back Side */}
                        <div
                          className={`absolute inset-0 glass-card p-8 rounded-xl bg-gradient-to-br ${step.gradient} bg-opacity-10`}
                          style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                          }}
                        >
                          <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <step.icon className="w-16 h-16 text-primary opacity-60" />
                            <h4 className="text-xl font-heading font-bold">Stage Details</h4>
                            <p className="text-sm text-muted-foreground">
                              Click to flip back
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Center timeline number - hidden on mobile, shown on desktop */}
                  <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 z-10">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${step.gradient} border-2 border-background/20 shadow-lg flex items-center justify-center backdrop-blur-sm`}>
                      <span className="text-base font-heading font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">{step.number}</span>
                    </div>
                  </div>

                  {/* Spacer for opposite side */}
                  <div className="hidden md:block md:w-[45%]" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }