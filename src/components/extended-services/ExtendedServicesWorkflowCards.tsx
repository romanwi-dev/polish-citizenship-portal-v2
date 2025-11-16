import { motion } from "framer-motion";
import { useState } from "react";
import { Users, FileText, Heart, Globe, Briefcase, Award, Shield, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { WORKFLOW_CARD_STANDARDS as STANDARDS } from "../workflows/workflow-card-standards";

const extendedServicesSteps = [
  {
    number: "01",
    title: "Family",
    description: "Assist multiple family members with citizenship applications, coordinating complex multi-generation cases.",
    icon: Users,
    gradient: "from-primary to-secondary",
    cta: "Family Services",
    detailedInfo: "Your extended family members can pursue Polish citizenship together. Coordinated multi-person applications benefit from shared research, document collection, and strategic timing for maximum efficiency and success.",
    keyPoints: [
      "Your spouse and children can apply simultaneously or sequentially",
      "Your shared family documents reduce costs across applications",
      "Your coordinated strategy optimizes processing timelines",
      "Your multi-generation cases benefit from bulk service discounts"
    ]
  },
  {
    number: "02",
    title: "Document Procurement",
    description: "Special document procurement for hard-to-find certificates, international records, and complex genealogy.",
    icon: FileText,
    gradient: "from-secondary to-accent",
    cta: "Document Help",
    detailedInfo: "Your difficult-to-obtain documents receive specialized procurement services. This includes international searches, genealogical detective work, and accessing restricted or hard-to-find records globally.",
    keyPoints: [
      "Your international records are pursued across multiple countries",
      "Your genealogical gaps are filled through expert research",
      "Your restricted archives can be accessed through special channels",
      "Your complex document needs receive dedicated specialist attention"
    ]
  },
  {
    number: "03",
    title: "Heritage Research",
    description: "Deep genealogical research to establish Polish ancestry connections and family history.",
    icon: Heart,
    gradient: "from-accent to-primary",
    cta: "Research Services",
    detailedInfo: "Your Polish heritage is researched in depth through professional genealogical investigation. This goes beyond citizenship requirements to explore your complete family history and Polish roots.",
    keyPoints: [
      "Your family tree is researched back multiple generations",
      "Your Polish ancestral villages and towns are identified",
      "Your historical context is provided for your family's story",
      "Your heritage research creates lasting family legacy documentation"
    ]
  },
  {
    number: "04",
    title: "International Coordination",
    description: "Coordination with international authorities for documents from multiple countries.",
    icon: Globe,
    gradient: "from-primary to-secondary",
    cta: "International Help",
    detailedInfo: "Your documents from multiple countries are coordinated through professional international networks. Partnerships with local experts ensure efficient document procurement from any jurisdiction worldwide.",
    keyPoints: [
      "Your multi-country document needs are coordinated efficiently",
      "Your international partners have local expertise and contacts",
      "Your foreign language documents are handled professionally",
      "Your complex international cases receive specialized support"
    ]
  },
  {
    number: "05",
    title: "Relocation Support",
    description: "Assistance with moving to Poland, finding housing, schools, and settling in.",
    icon: Briefcase,
    gradient: "from-secondary to-accent",
    cta: "Relocation Guide",
    detailedInfo: "Your relocation to Poland is supported with comprehensive assistance. From finding housing and schools to understanding Polish systems and culture, you receive guidance for successful settlement.",
    keyPoints: [
      "Your housing search is assisted with local market knowledge",
      "Your school options for children are researched and explained",
      "Your practical needs (banking, healthcare, etc.) are guided",
      "Your cultural integration is supported with local connections"
    ]
  },
  {
    number: "06",
    title: "Legal Consultation",
    description: "Expert legal advice on complex citizenship matters, dual citizenship, and Polish law.",
    icon: Shield,
    gradient: "from-accent to-primary",
    cta: "Legal Advice",
    detailedInfo: "Your complex legal questions receive expert attorney consultation. This covers dual citizenship implications, Polish law interpretation, special circumstances, and strategic legal planning.",
    keyPoints: [
      "Your dual citizenship status is analyzed for your country",
      "Your complex legal questions receive attorney-level answers",
      "Your special circumstances are evaluated by legal experts",
      "Your strategic legal planning is guided for optimal outcomes"
    ]
  },
  {
    number: "07",
    title: "VIP Service",
    description: "Premium white-glove service with dedicated attorney and priority processing.",
    icon: Award,
    gradient: "from-primary to-secondary",
    cta: "VIP Details",
    detailedInfo: "Your VIP service provides premium white-glove treatment with a dedicated senior attorney, priority processing, direct communication channels, and expedited handling at every stage.",
    keyPoints: [
      "Your dedicated senior attorney manages your entire case",
      "Your priority processing accelerates timelines where possible",
      "Your direct communication line ensures immediate responses",
      "Your VIP status receives preferential treatment throughout"
    ]
  },
  {
    number: "08",
    title: "Concierge Services",
    description: "Full-service concierge for all aspects of Polish citizenship and relocation process.",
    icon: Sparkles,
    gradient: "from-secondary to-accent",
    cta: "Concierge Help",
    detailedInfo: "Your concierge service provides full-spectrum support for everything related to your Polish citizenship journey and potential relocation. No task is too small - from document apostilles to apartment hunting.",
    keyPoints: [
      "Your every need is handled by a dedicated concierge team",
      "Your time is saved through comprehensive service handling",
      "Your stress is minimized with white-glove personal attention",
      "Your entire journey is managed from start to settlement"
    ]
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
              Extended Services
            </span>
          </motion.h2>
        </motion.div>

        <div className="relative max-w-6xl mx-auto">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 hidden md:block -z-10" />

          {extendedServicesSteps.map((step, index) => {
            const isLeft = index % 2 === 0;
            
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.05, 
                  ease: [0.25, 0.1, 0.25, 1]
                }}
                viewport={{ once: true, margin: "-200px" }}
                className={`mb-16 last:mb-0 flex flex-col md:${isLeft ? 'flex-row' : 'flex-row-reverse'} gap-4 md:gap-16 items-center`}
              >
                <div className="w-full md:w-[42%]">
                  <div 
                    className="relative h-[680px]"
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
                            Service Details
                          </h3>
                          
                          <div className="flex-1 space-y-3 w-full overflow-auto">
                            <div className="p-4 rounded-lg bg-muted/30 text-center">
                              <p className="text-sm text-muted-foreground">
                                Premium extended service for complex cases
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground/60 text-center mt-4">Tap to flip back</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                  <div className="hidden md:flex md:w-[16%] flex-shrink-0 justify-center relative z-10 items-center">
                    <div className="w-16 h-16 rounded-full glass-card bg-background/95 backdrop-blur-xl border border-border/50 shadow-[0_0_30px_rgba(0,0,0,0.3)] transition-all duration-300 flex items-center justify-center">
                      <span className="text-muted-foreground/50 font-heading font-bold text-3xl">{step.number}</span>
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