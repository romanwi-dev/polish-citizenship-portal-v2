import { motion } from "framer-motion";
import { useState } from "react";
import { FileText, CheckCircle, CreditCard, FileCheck, Send, FolderSearch, Archive, Languages, Upload, Stamp, Clock, Zap, Award, Book, Users, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import timelineDocument from "@/assets/timeline-document.png";
import timelineStamp from "@/assets/timeline-stamp.png";
import timelineCourthouse from "@/assets/timeline-courthouse.png";
import timelineFamily from "@/assets/timeline-family.png";
import timelinePassport from "@/assets/timeline-passport.png";
import timelineGraphic from "@/assets/timeline-graphic.png";
const timelineSteps = [{
  number: "1",
  title: "FIRST STEPS",
  description: "First contact, citizenship test, family tree, eligibility examination, and eligibility call",
  duration: "Week 1",
  keyAction: "Initial Setup & Payment",
  priority: "Major Milestone",
  icon: FileText,
  gradient: "from-blue-500 to-cyan-500",
  illustration: timelineDocument
}, {
  number: "2",
  title: "TERMS & PRICING",
  description: "Initial assessment, full process info with pricing, client confirmation, and document list",
  duration: "Week 1-2",
  keyAction: "Initial Setup & Payment",
  priority: "Foundation Building",
  icon: CreditCard,
  gradient: "from-cyan-500 to-blue-500",
  illustration: timelineDocument
}, {
  number: "3",
  title: "ADVANCE & ACCOUNT",
  description: "Advance payment processing and opening client portal account",
  duration: "Week 2",
  keyAction: "Initial Setup & Payment",
  priority: "Major Milestone",
  icon: CheckCircle,
  gradient: "from-blue-500 to-indigo-500",
  illustration: timelineStamp
}, {
  number: "4",
  title: "DETAILS & POAs",
  description: "Client provides basic details, POA preparation, and signed documents via FedEx",
  duration: "Week 2-3",
  keyAction: "Details & Application",
  priority: "Foundation Building",
  icon: FileCheck,
  gradient: "from-indigo-500 to-purple-500",
  illustration: timelineDocument
}, {
  number: "5",
  title: "DATA & APPLICATION",
  description: "Master form completion, AI paperwork generation, and official citizenship application submission",
  duration: "Week 3-4",
  keyAction: "Details & Application",
  priority: "Major Milestone",
  icon: Send,
  gradient: "from-purple-500 to-pink-500",
  illustration: timelineDocument
}, {
  number: "6",
  title: "LOCAL DOCUMENTS",
  description: "Document clarification, gathering local documents, and partner collaboration for collection",
  duration: "Week 4-8",
  keyAction: "Documentation & Translation",
  priority: "Major Milestone",
  icon: FolderSearch,
  gradient: "from-pink-500 to-rose-500",
  illustration: timelineDocument
}, {
  number: "7",
  title: "POLISH DOCUMENTS",
  description: "Polish archives search, international search, and partner processing for archival documents",
  duration: "Week 4-12",
  keyAction: "Documentation & Translation",
  priority: "Major Milestone",
  icon: Archive,
  gradient: "from-rose-500 to-red-500",
  illustration: timelineFamily
}, {
  number: "8",
  title: "TRANSLATIONS",
  description: "AI translation service, certified sworn translator certification, and translation agent supervision",
  duration: "Week 8-16",
  keyAction: "Documentation & Translation",
  priority: "Major Milestone",
  icon: Languages,
  gradient: "from-red-500 to-orange-500",
  illustration: timelineDocument
}, {
  number: "9",
  title: "FILING DOCUMENTS",
  description: "Submitting local documents and detailed family information before initial response",
  duration: "Week 12-18",
  keyAction: "Filing & Civil Acts",
  priority: "Active Processing",
  icon: Upload,
  gradient: "from-orange-500 to-amber-500",
  illustration: timelineDocument
}, {
  number: "10",
  title: "CIVIL ACTS",
  description: "Polish civil acts applications, payment processing, and dedicated civil acts agent supervision",
  duration: "Week 16-20",
  keyAction: "Filing & Civil Acts",
  priority: "Major Milestone",
  icon: Stamp,
  gradient: "from-amber-500 to-yellow-500",
  illustration: timelineStamp
}, {
  number: "11",
  title: "INITIAL RESPONSE",
  description: "Receiving initial response from Masovian Voivoda's office and extending procedure term",
  duration: "Month 10-18",
  keyAction: "Government Processing",
  priority: "Major Milestone",
  icon: Clock,
  gradient: "from-yellow-500 to-lime-500",
  illustration: timelineCourthouse
}, {
  number: "12",
  title: "PUSH SCHEMES",
  description: "Offering push schemes (PUSH, NUDGE, SIT-DOWN) and implementing strategies in practice",
  duration: "Month 12-20",
  keyAction: "Government Processing",
  priority: "Major Milestone",
  icon: Zap,
  gradient: "from-lime-500 to-green-500",
  illustration: timelineCourthouse
}, {
  number: "13",
  title: "CITIZENSHIP DECISION",
  description: "Polish citizenship confirmation decision received and added to client portal account",
  duration: "Month 18-24",
  keyAction: "Citizenship Confirmation",
  priority: "Critical Milestone",
  icon: Award,
  gradient: "from-green-500 to-emerald-500",
  illustration: timelineStamp
}, {
  number: "14",
  title: "POLISH PASSPORT",
  description: "Document preparation, final payment, FedEx delivery, consulate visit, and passport application",
  duration: "Month 20-26",
  keyAction: "Passport & Extended Services",
  priority: "Major Milestone",
  icon: Book,
  gradient: "from-emerald-500 to-teal-500",
  illustration: timelinePassport
}, {
  number: "15",
  title: "EXTENDED SERVICES",
  description: "Extended family legal services for comprehensive ongoing support",
  duration: "Ongoing",
  keyAction: "Passport & Extended Services",
  priority: "Final Achievement",
  icon: Users,
  gradient: "from-teal-500 to-cyan-500",
  illustration: timelineFamily
}];
export default function TimelineProcessEnhanced() {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const toggleFlip = (stepNumber: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };
  return <section id="timeline" className="relative py-24 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/95 to-background" />
      <div className="absolute inset-0" style={{
      backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary) / 0.1) 1px, transparent 0)`,
      backgroundSize: '48px 48px'
    }} />
      
      <div className="container relative z-10 mx-auto px-4">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} viewport={{
        once: true
      }} className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-16">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Process Timeline</span>
          </div>
          <motion.h2 initial={{
          opacity: 0,
          scale: 0.9,
          y: 30
        }} whileInView={{
          opacity: 1,
          scale: 1,
          y: 0
        }} transition={{
          duration: 2.5,
          delay: 0.3,
          type: "spring",
          stiffness: 40,
          damping: 20
        }} viewport={{
          once: true
        }} className="text-5xl md:text-8xl font-heading font-black mb-14 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-fade-in-up glow-text drop-shadow-2xl">
              Complete Legal Process Timeline
            </span>
          </motion.h2>
          <motion.p initial={{
          opacity: 0
        }} whileInView={{
          opacity: 1
        }} transition={{
          duration: 0.6,
          delay: 0.4
        }} viewport={{
          once: true
        }} className="text-xl text-muted-foreground max-w-3xl mx-auto mb-16">Your journey to Polish citizenship through our comprehensive 15-part process.        Many parts are processed simultaneously to save time.</motion.p>
        </motion.div>

        {/* Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Center line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 hidden md:block" />

          {timelineSteps.map((step, index) => <motion.div key={step.number} initial={{
          opacity: 0,
          x: index % 2 === 0 ? -50 : 50
        }} whileInView={{
          opacity: 1,
          x: 0
        }} transition={{
          duration: 0.6,
          delay: index * 0.1
        }} viewport={{
          once: true,
          margin: "-100px"
        }} className={`relative mb-16 md:mb-24 flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              {/* Content Card */}
              <div className="w-full md:w-5/12">
                <div className="relative h-[400px]" style={{
              perspective: '1000px'
            }}>
                  <div onClick={() => toggleFlip(step.number)} className="absolute inset-0 cursor-pointer transition-transform duration-700" style={{
                transformStyle: 'preserve-3d',
                transform: flippedCards[step.number] ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}>
                    {/* Front Side */}
                    <motion.div whileHover={{
                  scale: 1.02
                }} transition={{
                  duration: 0.3
                }} className="absolute inset-0 glass-card p-6 rounded-lg hover-glow group" style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}>
                      <div className="flex flex-col gap-3 h-full">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-base md:text-xs font-bold px-3 py-1.5 md:px-2 md:py-1 rounded-full bg-gradient-to-r ${step.gradient} text-white`}>
                            {step.number}
                          </span>
                          <span className="text-xs text-muted-foreground">{step.duration}</span>
                        </div>
                        <motion.h3 initial={{
                      opacity: 0,
                      x: -20,
                      scale: 0.95
                    }} whileInView={{
                      opacity: 1,
                      x: 0,
                      scale: 1
                    }} transition={{
                      duration: 2,
                      delay: index * 0.08,
                      type: "spring",
                      stiffness: 60,
                      damping: 15
                    }} viewport={{
                      once: true
                    }} className="text-2xl md:text-3xl font-heading font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-110 transition-all duration-300 drop-shadow-lg">
                          {step.title}
                        </motion.h3>
                        <p className="text-sm text-muted-foreground mb-3 flex-1">
                          {step.description}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {step.keyAction}
                          </span>
                          <span className="text-xs px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                            {step.priority}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground/60 mt-2 text-center">Tap to see details</p>
                      </div>
                    </motion.div>

                    {/* Back Side */}
                    <div className="absolute inset-0 glass-card p-6 rounded-lg hover-glow" style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}>
                      <div className="flex flex-col gap-3 h-full">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-base md:text-xs font-bold px-3 py-1.5 md:px-2 md:py-1 rounded-full bg-gradient-to-r ${step.gradient} text-white`}>
                            {step.number}
                          </span>
                          <span className="text-xs text-primary/60">Details</span>
                        </div>
                        <h3 className="text-xl font-heading font-bold tracking-tight text-card-foreground mb-2">
                          More Information
                        </h3>
                        <div className="flex-1 overflow-auto">
                          <p className="text-sm text-muted-foreground italic">
                            [Admin: Add detailed information about this step here. This content will be customized for each timeline step to provide additional context, requirements, or important notes for clients.]
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground/60 text-center mt-2">Tap to flip back</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Circle with Number */}
              <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
                <motion.div initial={{
              scale: 0
            }} whileInView={{
              scale: 1
            }} transition={{
              duration: 0.5,
              delay: index * 0.1 + 0.2
            }} viewport={{
              once: true
            }} className="relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary p-1 animate-float" style={{
              animationDelay: `${index * 0.2}s`
            }}>
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                    <span className="text-4xl font-heading font-black bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                      {step.number}
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-xl -z-10" />
                </motion.div>
              </div>

              {/* Empty space for layout balance */}
              <div className="w-full md:w-5/12 hidden md:block" />
            </motion.div>)}
        </div>

        {/* Expert Tip */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} whileInView={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.6
      }} viewport={{
        once: true
      }} className="mt-16 glass-card p-8 rounded-lg max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-card-foreground">Expert Legal Guidance</h3>
          </div>
          <p className="text-muted-foreground text-left w-full">
            Every case is unique. Our 20+ years of experience in Polish citizenship law ensures your application 
            receives professional attention at each critical stage. We handle complex genealogical research, 
            navigate bureaucratic requirements, and provide ongoing support throughout your journey.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{
        opacity: 0,
        scale: 0.9
      }} whileInView={{
        opacity: 1,
        scale: 1
      }} transition={{
        duration: 0.6
      }} viewport={{
        once: true
      }} className="text-center mt-12">
          <Button size="lg" className="text-2xl font-bold px-20 py-6 h-auto rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow group relative overflow-hidden backdrop-blur-md border border-white/30" onClick={() => document.getElementById('contact')?.scrollIntoView({
          behavior: 'smooth'
        })}>
            <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Check Your Eligibility
            </span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </motion.div>
      </div>
    </section>;
}