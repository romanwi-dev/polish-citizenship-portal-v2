import { motion } from "framer-motion";
import { useState } from "react";
import { FileText, Send, Clock, CheckCircle, Building2, Award, CreditCard, UserCheck } from "lucide-react";
import { Button } from "../ui/button";
import { WORKFLOW_CARD_STANDARDS as STANDARDS } from "../workflows/workflow-card-standards";

const civilActsSteps = [
  {
    number: "01",
    title: "Application Prep",
    description: "Prepare Polish civil registry applications for birth/marriage certificates needed for citizenship case.",
    icon: FileText,
    gradient: "from-primary to-secondary",
    cta: "Prepare Application",
    detailedInfo: "Your Polish civil registry applications (akty stanu cywilnego) are professionally prepared to obtain official Polish birth or marriage certificates required for your citizenship case. Each application is tailored to the specific registry office jurisdiction.",
    keyPoints: [
      "Your application is prepared for the correct USC jurisdiction",
      "Your family details are formatted per Polish civil registry requirements",
      "Your application includes all necessary genealogical references",
      "Your request specifies the exact document type needed"
    ]
  },
  {
    number: "02",
    title: "Payment Processing",
    description: "Process payment for civil acts application fees and our service charge.",
    icon: CreditCard,
    gradient: "from-secondary to-accent",
    cta: "Process Payment",
    detailedInfo: "Your civil acts fees are processed, covering both the Polish government's official charges and the professional service fee. Payment is secure and tracked for your records.",
    keyPoints: [
      "Your Polish government fees are calculated per document type",
      "Your service fee covers professional application preparation",
      "Your payment is processed securely with receipt confirmation",
      "Your fees are transparent with no hidden costs"
    ]
  },
  {
    number: "03",
    title: "Submit to USC",
    description: "Submit application to relevant Polish Civil Registry office (USC) for processing.",
    icon: Send,
    gradient: "from-accent to-primary",
    cta: "Track Submission",
    detailedInfo: "Your application is officially submitted to the appropriate Polish civil registry office (Urząd Stanu Cywilnego). The submission is tracked and monitored for response.",
    keyPoints: [
      "Your application reaches the correct USC office",
      "Your submission is tracked with reference numbers",
      "Your filing date is recorded for timeline monitoring",
      "Your USC contact information is logged for follow-up"
    ]
  },
  {
    number: "04",
    title: "USC Processing",
    description: "USC processes application, verifies information, and prepares official certificates.",
    icon: Building2,
    gradient: "from-primary to-secondary",
    cta: "Check Status",
    detailedInfo: "Your application is processed by the Polish civil registry office. They verify the information against their records and prepare the official certified certificates with government seals.",
    keyPoints: [
      "Your information is verified in Polish civil registry records",
      "Your certificates are prepared with official government authentication",
      "Your processing follows Polish administrative law timelines",
      "Your application status is monitored for any queries"
    ]
  },
  {
    number: "05",
    title: "Awaiting Response",
    description: "Monitoring USC response time and following up on delayed applications.",
    icon: Clock,
    gradient: "from-secondary to-accent",
    cta: "View Timeline",
    detailedInfo: "Your civil acts application is monitored during the processing period. Any delays trigger follow-up communications with the USC office to ensure timely certificate issuance.",
    keyPoints: [
      "Your timeline is tracked (typically 4-12 weeks for Polish USC)",
      "Your delayed applications receive prompt follow-up",
      "Your status is updated in your portal regularly",
      "Your urgent cases can be expedited when legally possible"
    ]
  },
  {
    number: "06",
    title: "Agent Verification",
    description: "Civil Acts Agent verifies received certificates for accuracy and completeness.",
    icon: UserCheck,
    gradient: "from-accent to-primary",
    cta: "Agent Dashboard",
    detailedInfo: "Your received certificates are verified by the dedicated Civil Acts Agent. Each document is checked for accuracy, completeness, proper authentication, and suitability for citizenship case use.",
    keyPoints: [
      "Your certificates are verified by a specialized agent",
      "Your document details are cross-checked against application",
      "Your government seals and signatures are authenticated",
      "Your certificates are evaluated for citizenship case requirements"
    ]
  },
  {
    number: "07",
    title: "Certificate Review",
    description: "Review Polish birth/marriage certificates for legal accuracy and required details.",
    icon: Award,
    gradient: "from-primary to-secondary",
    cta: "Review Certificate",
    detailedInfo: "Your Polish civil acts undergo legal review to ensure all required details are present and accurate. Any discrepancies or missing information triggers corrective action or additional applications.",
    keyPoints: [
      "Your certificates contain all legally required information",
      "Your names, dates, and places are verified for accuracy",
      "Your parent information is complete and matches other documents",
      "Your certificates meet WSC citizenship application standards"
    ]
  },
  {
    number: "08",
    title: "Ready for Case",
    description: "Certified Polish civil acts received and ready to include in citizenship case.",
    icon: CheckCircle,
    gradient: "from-secondary to-accent",
    cta: "Add to Case",
    detailedInfo: "Your Polish civil acts are certified, verified, and ready to be included as official evidence in your citizenship application. They strengthen your case with authentic Polish government documentation.",
    keyPoints: [
      "Your certificates are certified with official Polish seals",
      "Your civil acts are ready for inclusion in WSC submission",
      "Your documents are cataloged in your case file",
      "Your citizenship case now has stronger Polish documentary evidence"
    ]
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
              Transcription Workflow
            </span>
          </motion.h2>
        </motion.div>

          <div className="relative max-w-6xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-primary/20 via-primary/40 to-primary/20 hidden md:block" />
            
            {civilActsSteps.map((step, index) => {
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
                    <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-background/20 shadow-lg flex items-center justify-center backdrop-blur-sm">
                      <span className="text-2xl font-heading font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">{parseInt(step.number)}</span>
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