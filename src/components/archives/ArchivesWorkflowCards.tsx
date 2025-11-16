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
    detailedInfo: "Your relevant archives are identified based on your ancestors' locations and time periods. Polish state archives, civil registry offices (USC), and international repositories are researched to determine which institutions likely possess your family's historical records.",
    keyPoints: [
      "Your family locations are cross-referenced with archive jurisdictions",
      "Your time periods are matched to existing archive collections",
      "Your ancestor names are prepared for Polish archive searches",
      "Your research strategy is customized for maximum document recovery"
    ]
  },
  {
    number: "02",
    title: "Request Preparation",
    description: "Prepare official archive requests in Polish using proper templates and genealogical data.",
    icon: FileSearch,
    gradient: "from-secondary to-accent",
    cta: "Prepare Requests",
    detailedInfo: "Your archive requests are professionally prepared in Polish following official protocols. Each request includes precise genealogical data, time periods, and specific document types needed for your citizenship case.",
    keyPoints: [
      "Your requests are written in formal Polish archive language",
      "Your genealogical details are formatted per archive requirements",
      "Your document types are specified (birth, marriage, death, residence)",
      "Your requests are optimized for comprehensive archive searches"
    ]
  },
  {
    number: "03",
    title: "Submit to Archives",
    description: "Submit requests to Polish archives (USC, State Archives) and international archives.",
    icon: Send,
    gradient: "from-accent to-primary",
    cta: "Track Submissions",
    detailedInfo: "Your requests are officially submitted to relevant Polish state archives, civil registry offices, and any necessary international repositories. Each submission is tracked and monitored for responses.",
    keyPoints: [
      "Your requests reach Polish Archiwum Państwowe institutions",
      "Your civil registry (USC) inquiries are submitted properly",
      "Your international archive requests are coordinated when needed",
      "Your submission dates and reference numbers are logged for tracking"
    ]
  },
  {
    number: "04",
    title: "Partner Coordination",
    description: "Coordinate with local genealogy partners who have direct archive access and contacts.",
    icon: Users,
    gradient: "from-primary to-secondary",
    cta: "View Partners",
    detailedInfo: "Your case benefits from coordination with trusted local genealogy partners in Poland who have established relationships with archives and can expedite searches or access restricted collections.",
    keyPoints: [
      "Your searches are supported by on-site Polish genealogy professionals",
      "Your partners have direct archive access and established contacts",
      "Your complex cases receive specialized local expertise",
      "Your restricted records may be accessible through partner connections"
    ]
  },
  {
    number: "05",
    title: "Awaiting Response",
    description: "Monitor archive responses and follow up on delayed or incomplete replies.",
    icon: Clock,
    gradient: "from-secondary to-accent",
    cta: "Check Status",
    detailedInfo: "Your archive requests are actively monitored as Polish archives can take weeks to months to respond. Any delays or incomplete responses trigger follow-up inquiries to ensure complete document recovery.",
    keyPoints: [
      "Your response timeline is tracked (typically 2-8 weeks for Polish archives)",
      "Your delayed requests receive prompt follow-up communications",
      "Your incomplete responses trigger additional clarification requests",
      "Your case status is updated regularly with archive progress"
    ]
  },
  {
    number: "06",
    title: "Document Verification",
    description: "Verify received documents for authenticity and completeness, identify missing pieces.",
    icon: Award,
    gradient: "from-accent to-primary",
    cta: "Verify Documents",
    detailedInfo: "Your received archive documents undergo thorough verification to confirm authenticity, completeness, and relevance to your citizenship case. Any gaps or inconsistencies are identified for additional research.",
    keyPoints: [
      "Your documents are authenticated for official government seals and signatures",
      "Your information is cross-verified against known family data",
      "Your document completeness is assessed for citizenship requirements",
      "Your missing pieces are identified for targeted additional searches"
    ]
  },
  {
    number: "07",
    title: "USC Workflow",
    description: "Process umiejscowienie (localization) and uzupełnienie (completion) with Polish Civil Registry.",
    icon: Building2,
    gradient: "from-primary to-secondary",
    cta: "USC Tracking",
    detailedInfo: "Your civil registry records undergo specialized USC procedures: umiejscowienie (determining which registry office holds records) and uzupełnienie (requesting complete certificate copies from the located office).",
    keyPoints: [
      "Your umiejscowienie request identifies the correct USC office location",
      "Your uzupełnienie request obtains full certified certificate copies",
      "Your USC procedures are tracked as separate workflow tasks",
      "Your certificates arrive with official Polish government authentication"
    ]
  },
  {
    number: "08",
    title: "Documents Ready",
    description: "Archive documents authenticated and ready for translation and submission.",
    icon: CheckCircle,
    gradient: "from-secondary to-accent",
    cta: "View Results",
    detailedInfo: "Your archive documents are verified, authenticated, and prepared for the next stages. They're ready for sworn translation and eventual submission as evidence in your citizenship application.",
    keyPoints: [
      "Your documents are authenticated with official archive seals",
      "Your certificates are ready for certified Polish translation",
      "Your evidence package is organized and cataloged",
      "Your case moves forward to translation and filing stages"
    ]
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
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 hidden md:block -z-10" />

          {archivesSteps.map((step, index) => {
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
                    className="relative h-[480px]"
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
                      {/* Front */}
                      <motion.div
                        whileHover={{ scale: 1.02, y: -3 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute inset-0 w-full h-[480px] glass-card p-8 rounded-lg hover-glow group flex flex-col"
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

                      {/* Back Side */}
                      {/* Back */}
                      <div 
                        className="absolute inset-0 w-full h-[480px] glass-card p-8 rounded-lg hover-glow flex flex-col"
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
                          <div className="flex-1 space-y-3">
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