import { useState } from "react";
import { FileText, CheckCircle, CreditCard, FileCheck, Send, FolderSearch, Archive, Languages, Upload, Stamp, Clock, Zap, Award, Book, Users, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Using pure CSS animations for optimal performance

// Optimized WebP images for better performance
import timeline01 from "@/assets/timeline-01-first-steps.webp";
import timeline02 from "@/assets/timeline-02-terms-pricing.webp";
import timeline03 from "@/assets/timeline-03-advance-account.webp";
import timeline04 from "@/assets/timeline-04-poa.webp";
import timeline05 from "@/assets/timeline-05-application.webp";
import timeline06 from "@/assets/timeline-06-local-docs.webp";
import timeline07 from "@/assets/timeline-07-polish-docs.webp";
import timeline08 from "@/assets/timeline-08-translation.webp";
import timeline09 from "@/assets/timeline-09-filing.webp";
import timeline10 from "@/assets/timeline-10-civil-acts.webp";
import timeline11 from "@/assets/timeline-11-initial-response.webp";
import timeline12 from "@/assets/timeline-12-push-schemes.webp";
import timeline13 from "@/assets/timeline-13-citizenship.webp";
import timeline14 from "@/assets/timeline-14-passport.webp";
import timeline15 from "@/assets/timeline-15-extended.webp";
const timelineSteps = [{
  number: "1",
  title: "FIRST STEPS",
  description: "First contact, citizenship test, family tree, eligibility examination, and eligibility call",
  duration: "Week 1",
  keyAction: "Initial Setup & Payment",
  priority: "Major Milestone",
  icon: FileText,
  gradient: "from-blue-500 to-cyan-500",
  image: timeline01
}, {
  number: "2",
  title: "TERMS & PRICING",
  description: "Initial assessment, full process info with pricing, client confirmation, and document list",
  duration: "Week 1-2",
  keyAction: "Initial Setup & Payment",
  priority: "Foundation Building",
  icon: CreditCard,
  gradient: "from-cyan-500 to-blue-500",
  image: timeline02
}, {
  number: "3",
  title: "ADVANCE & ACCOUNT",
  description: "Advance payment processing and opening client portal account",
  duration: "Week 2",
  keyAction: "Initial Setup & Payment",
  priority: "Major Milestone",
  icon: CheckCircle,
  gradient: "from-blue-500 to-indigo-500",
  image: timeline03
}, {
  number: "4",
  title: "DETAILS & POAs",
  description: "Client provides basic details, POA preparation, and signed documents via FedEx",
  duration: "Week 2-3",
  keyAction: "Details & Application",
  priority: "Foundation Building",
  icon: FileCheck,
  gradient: "from-indigo-500 to-purple-500",
  image: timeline04
}, {
  number: "5",
  title: "DATA & APPLICATION",
  description: "Master form completion, AI paperwork generation, and official citizenship application submission",
  duration: "Week 3-4",
  keyAction: "Details & Application",
  priority: "Major Milestone",
  icon: Send,
  gradient: "from-purple-500 to-pink-500",
  image: timeline05
}, {
  number: "6",
  title: "LOCAL DOCUMENTS",
  description: "Document clarification, gathering local documents, and partner collaboration for collection",
  duration: "Week 4-8",
  keyAction: "Documentation & Translation",
  priority: "Major Milestone",
  icon: FolderSearch,
  gradient: "from-pink-500 to-rose-500",
  image: timeline06
}, {
  number: "7",
  title: "POLISH DOCUMENTS",
  description: "Polish archives search, international search, and partner processing for archival documents",
  duration: "Week 4-12",
  keyAction: "Documentation & Translation",
  priority: "Major Milestone",
  icon: Archive,
  gradient: "from-rose-500 to-red-500",
  image: timeline07
}, {
  number: "8",
  title: "TRANSLATIONS",
  description: "AI translation service, certified sworn translator certification, and translation agent supervision",
  duration: "Week 8-16",
  keyAction: "Documentation & Translation",
  priority: "Major Milestone",
  icon: Languages,
  gradient: "from-red-500 to-orange-500",
  image: timeline08
}, {
  number: "9",
  title: "FILING DOCUMENTS",
  description: "Submitting local documents and detailed family information before initial response",
  duration: "Week 12-18",
  keyAction: "Filing & Civil Acts",
  priority: "Active Processing",
  icon: Upload,
  gradient: "from-orange-500 to-amber-500",
  image: timeline09
}, {
  number: "10",
  title: "CIVIL ACTS",
  description: "Polish civil acts applications, payment processing, and dedicated civil acts agent supervision",
  duration: "Week 16-20",
  keyAction: "Filing & Civil Acts",
  priority: "Major Milestone",
  icon: Stamp,
  gradient: "from-amber-500 to-yellow-500",
  image: timeline10
}, {
  number: "11",
  title: "INITIAL RESPONSE",
  description: "Receiving initial response from Masovian Voivoda's office and extending procedure term if needed",
  duration: "Month 10-18",
  keyAction: "Government Processing",
  priority: "Major Milestone",
  icon: Clock,
  gradient: "from-yellow-500 to-lime-500",
  image: timeline11
}, {
  number: "12",
  title: "PUSH SCHEMES",
  description: "Offering push schemes (PUSH, NUDGE, SIT-DOWN, SLOW) and implementing strategies in practice",
  duration: "Month 12-20",
  keyAction: "Government Processing",
  priority: "Major Milestone",
  icon: Zap,
  gradient: "from-lime-500 to-green-500",
  image: timeline12
}, {
  number: "13",
  title: "CITIZENSHIP DECISION",
  description: "Polish citizenship confirmation decision received and added to client portal account",
  duration: "Month 18-24",
  keyAction: "Citizenship Confirmation",
  priority: "Critical Milestone",
  icon: Award,
  gradient: "from-green-500 to-emerald-500",
  image: timeline13
}, {
  number: "14",
  title: "POLISH PASSPORT",
  description: "Document preparation, final payment, FedEx delivery, consulate visit, and passport application",
  duration: "Month 20-26",
  keyAction: "Passport & Extended Services",
  priority: "Major Milestone",
  icon: Book,
  gradient: "from-emerald-500 to-teal-500",
  image: timeline14
}, {
  number: "15",
  title: "EXTENDED SERVICES",
  description: "Extended family legal services for comprehensive ongoing support",
  duration: "Ongoing",
  keyAction: "Passport & Extended Services",
  priority: "Final Achievement",
  icon: Users,
  gradient: "from-teal-500 to-cyan-500",
  image: timeline15
}];
export default function TimelineProcessEnhanced() {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();

  const toggleFlip = (stepNumber: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };
  return <section id="timeline" className="relative py-24 overflow-hidden">
      
      <div className="container relative z-10 mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-16">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Process Timeline</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-heading font-black mb-14 tracking-tight animate-scale-in" style={{ animationDelay: '150ms' }}>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-fade-in-up glow-text drop-shadow-2xl">
              Complete Legal Process Timeline
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: '200ms' }}>
            Complex journey to Polish citizenship through our comprehensive 15-part process. Many stages are always processed simultaneously to save time.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Center line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 hidden md:block" />

          {timelineSteps.map((step, index) => <div 
            key={step.number} 
            className={`relative mb-16 md:mb-24 flex flex-col md:flex-row items-center gap-8 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''} ${prefersReducedMotion ? '' : 'animate-fade-in'}`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
              {/* Content Card */}
              <div className="w-full md:w-5/12">
                <div className="relative h-[280px] md:h-[400px]" style={{
              perspective: '1000px'
            }}>
                  <div 
                    onClick={() => toggleFlip(step.number)} 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleFlip(step.number);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label={`${step.title} - ${isMobile ? 'Tap' : 'Click'} to view details`}
                    className="absolute inset-0 cursor-pointer transition-transform duration-700 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg" 
                    style={{
                transformStyle: 'preserve-3d',
                transform: flippedCards[step.number] ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}>
                    {/* Front Side */}
                    <div className="absolute inset-0 glass-card p-6 rounded-lg hover-glow group transition-transform duration-300 hover:scale-[1.02]" style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}>
                      <div className="flex flex-col gap-3 h-full">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm md:text-xs font-bold px-3 py-1.5 md:px-2 md:py-1 rounded-full bg-gradient-to-r ${step.gradient} text-white`}>
                            {step.number}
                          </span>
                          <span className="text-xs text-muted-foreground">{step.duration}</span>
                        </div>
                        <h3 className={`text-xl md:text-2xl lg:text-3xl font-heading font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-110 transition-all duration-300 drop-shadow-lg ${prefersReducedMotion ? '' : 'animate-fade-in'}`}>
                          {step.title}
                        </h3>
                        <p className="text-xs md:text-sm text-muted-foreground mb-3 flex-1 line-clamp-3 md:line-clamp-none">
                          {step.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 md:gap-2">
                          <span className="text-xs px-2 py-1 md:px-3 md:py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {step.keyAction}
                          </span>
                          <span className="text-xs px-2 py-1 md:px-3 md:py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                            {step.priority}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground/60 mt-2 text-center">{isMobile ? 'Tap' : 'Click'} to see details</p>
                      </div>
                    </div>

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
                <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary p-1 animate-float ${prefersReducedMotion ? '' : 'animate-scale-in'}`} style={{
              animationDelay: `${index * 0.2}s`
            }}>
                  <div className="w-full h-full rounded-full bg-card flex items-center justify-center">
                    <span className="text-4xl font-heading font-black bg-gradient-to-br from-primary to-secondary bg-clip-text text-transparent">
                      {step.number}
                    </span>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 blur-xl -z-10" />
                </div>
              </div>

              {/* Empty space for layout balance */}
              <div className="w-full md:w-5/12 hidden md:block" />
            </div>)}
        </div>

        {/* Expert Tip */}
        <div className="mt-16 glass-card p-8 rounded-lg max-w-3xl mx-auto animate-fade-in">
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
        </div>

        {/* CTA */}
        <div className={`text-center mt-12 ${prefersReducedMotion ? '' : 'animate-fade-in animate-scale-in'}`}>
          <Button 
            size="lg" 
            className="text-lg md:text-2xl font-bold px-8 py-4 md:px-20 md:py-6 h-auto min-h-[48px] rounded-lg bg-card/10 hover:bg-card/20 shadow-glow hover-glow group relative overflow-hidden backdrop-blur-md border border-border/30" 
            onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
            aria-label="Take the Polish Citizenship Test to check your eligibility"
          >
            <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-bold">
              Take Polish Citizenship Test
            </span>
            <div className="absolute inset-0 bg-card/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Button>
        </div>
      </div>
    </section>;
}