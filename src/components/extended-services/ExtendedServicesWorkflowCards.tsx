import { motion } from "framer-motion";
import { useState } from "react";
import { Users, FileText, Heart, Globe, Briefcase, Award, Shield, Sparkles } from "lucide-react";
import { Button } from "../ui/button";

const extendedServicesSteps = [
  {
    number: "01",
    title: "Family Legal Services",
    description: "Assist multiple family members with citizenship applications, coordinating complex multi-generation cases.",
    icon: Users,
    gradient: "from-primary to-secondary",
    cta: "Family Services",
  },
  {
    number: "02",
    title: "Document Procurement",
    description: "Special document procurement for hard-to-find certificates, international records, and complex genealogy.",
    icon: FileText,
    gradient: "from-secondary to-accent",
    cta: "Document Help",
  },
  {
    number: "03",
    title: "Heritage Research",
    description: "Deep genealogical research to establish Polish ancestry connections and family history.",
    icon: Heart,
    gradient: "from-accent to-primary",
    cta: "Research Services",
  },
  {
    number: "04",
    title: "International Coordination",
    description: "Coordination with international authorities for documents from multiple countries.",
    icon: Globe,
    gradient: "from-primary to-secondary",
    cta: "International Help",
  },
  {
    number: "05",
    title: "Relocation Support",
    description: "Assistance with moving to Poland, finding housing, schools, and settling in.",
    icon: Briefcase,
    gradient: "from-secondary to-accent",
    cta: "Relocation Guide",
  },
  {
    number: "06",
    title: "Legal Consultation",
    description: "Expert legal advice on complex citizenship matters, dual citizenship, and Polish law.",
    icon: Shield,
    gradient: "from-accent to-primary",
    cta: "Legal Advice",
  },
  {
    number: "07",
    title: "VIP Service",
    description: "Premium white-glove service with dedicated attorney and priority processing.",
    icon: Award,
    gradient: "from-primary to-secondary",
    cta: "VIP Details",
  },
  {
    number: "08",
    title: "Concierge Services",
    description: "Full-service concierge for all aspects of Polish citizenship and relocation process.",
    icon: Sparkles,
    gradient: "from-secondary to-accent",
    cta: "Concierge Help",
  },
];

export default function ExtendedServicesWorkflowCards() {
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
              Extended Services
            </span>
          </motion.h2>
        </motion.div>

        <div className="relative max-w-6xl mx-auto">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 hidden md:block" />

          {extendedServicesSteps.map((step, index) => {
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
                            Service Details
                          </h3>
                          <div className="flex-1 overflow-auto space-y-3">
                            <div className="p-3 rounded-lg bg-muted/30">
                              <p className="text-sm text-muted-foreground">
                                Premium extended service for complex cases
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