import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, CreditCard, FileCheck, Send, FolderSearch, Archive, Languages, Upload, Stamp, Clock, Zap, Award, Book, Users, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { MainCTA } from "./ui/main-cta";
import { Card } from "./ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTranslation } from 'react-i18next';

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

// Compact icon illustrations
import step1Icon from "@/assets/timeline-step1.png";
import step2Icon from "@/assets/timeline-step2.png";
import step3Icon from "@/assets/timeline-step3.png";
import step4Icon from "@/assets/timeline-step4.png";
import step5Icon from "@/assets/timeline-step5.png";
import step6Icon from "@/assets/timeline-step6.png";
import step7Icon from "@/assets/timeline-step7.png";
import step8Icon from "@/assets/timeline-step8.png";
import step9Icon from "@/assets/timeline-step9.png";
import step10Icon from "@/assets/timeline-step10.png";
import step11Icon from "@/assets/timeline-step11.png";
import step12Icon from "@/assets/timeline-step12.png";
import step13Icon from "@/assets/timeline-step13.png";
import step14Icon from "@/assets/timeline-step14.png";
import step15Icon from "@/assets/timeline-step15.png";

export default function TimelineProcessEnhanced() {
  const { t, i18n } = useTranslation();
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [firstCardAnimated, setFirstCardAnimated] = useState(false);
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const [, forceUpdate] = useState({});

  // Force re-render when language changes
  useEffect(() => {
    forceUpdate({});
  }, [i18n.language]);

  const timelineSteps = [{
    number: "1",
    title: t('timelineProcess.stage1'),
    description: t('timelineProcess.stage1Desc'),
    duration: t('timelineProcess.stage1Duration'),
    keyAction: t('timelineProcess.stage1Action'),
    priority: t('timelineProcess.majorMilestone'),
    icon: FileText,
    gradient: "from-blue-500 to-cyan-500",
    image: timeline01,
    detailedInfo: "We begin with understanding your unique citizenship case through a comprehensive consultation. Our expert team reviews your initial eligibility, discusses your family history, and outlines the complete path ahead.",
    keyPoints: [
      "Free initial eligibility assessment",
      "Expert consultation on your citizenship path",
      "Clear timeline and process explanation",
      "Personalized case strategy development"
    ]
  }, {
    number: "2",
    title: t('timelineProcess.stage2'),
    description: t('timelineProcess.stage2Desc'),
    duration: t('timelineProcess.stage2Duration'),
    keyAction: t('timelineProcess.stage2Action'),
    priority: t('timelineProcess.foundationBuilding'),
    icon: CreditCard,
    gradient: "from-cyan-500 to-blue-500",
    image: timeline02,
    detailedInfo: "Take our comprehensive citizenship test to evaluate your eligibility. This assessment analyzes your family history, documents, and eligibility criteria to determine your chances of success.",
    keyPoints: [
      "Comprehensive eligibility evaluation",
      "Family history analysis",
      "Document requirements assessment",
      "Detailed eligibility report"
    ]
  }, {
    number: "3",
    title: t('timelineProcess.stage3'),
    description: t('timelineProcess.stage3Desc'),
    duration: t('timelineProcess.stage3Duration'),
    keyAction: t('timelineProcess.stage3Action'),
    priority: t('timelineProcess.majorMilestone'),
    icon: CheckCircle,
    gradient: "from-blue-500 to-indigo-500",
    image: timeline03,
    detailedInfo: "We build your complete family tree, tracing your Polish ancestry and identifying the key ancestor through whom you claim citizenship. This genealogical research is crucial for your application.",
    keyPoints: [
      "Professional genealogical research",
      "Multi-generation family tree construction",
      "Key ancestor identification",
      "Historical records verification"
    ]
  }, {
    number: "4",
    title: t('timelineProcess.stage4'),
    description: t('timelineProcess.stage4Desc'),
    duration: t('timelineProcess.stage4Duration'),
    keyAction: t('timelineProcess.stage4Action'),
    priority: t('timelineProcess.foundationBuilding'),
    icon: FileCheck,
    gradient: "from-indigo-500 to-purple-500",
    image: timeline04,
    detailedInfo: "Receive transparent pricing for your specific case. We provide clear cost breakdowns with no hidden fees, and present flexible payment options to suit your needs.",
    keyPoints: [
      "Transparent pricing structure",
      "No hidden fees guarantee",
      "Flexible payment options",
      "Detailed cost breakdown"
    ]
  }, {
    number: "5",
    title: t('timelineProcess.stage5'),
    description: t('timelineProcess.stage5Desc'),
    duration: t('timelineProcess.stage5Duration'),
    keyAction: t('timelineProcess.stage5Action'),
    priority: t('timelineProcess.majorMilestone'),
    icon: Send,
    gradient: "from-purple-500 to-pink-500",
    image: timeline05,
    detailedInfo: "Complete your payment and officially begin your citizenship journey. Gain immediate access to your personal client portal where you can track progress and communicate with our team.",
    keyPoints: [
      "Secure payment processing",
      "Immediate portal access",
      "Dedicated case manager assignment",
      "Official process initiation"
    ]
  }, {
    number: "6",
    title: t('timelineProcess.stage6'),
    description: t('timelineProcess.stage6Desc'),
    duration: t('timelineProcess.stage6Duration'),
    keyAction: t('timelineProcess.stage6Action'),
    priority: t('timelineProcess.majorMilestone'),
    icon: FolderSearch,
    gradient: "from-pink-500 to-rose-500",
    image: timeline06,
    detailedInfo: "Create your secure account on our advanced client portal. Access all forms, upload documents, track your case status in real-time, and communicate directly with your legal team.",
    keyPoints: [
      "Secure portal account creation",
      "Real-time case tracking",
      "Document upload system",
      "Direct team communication"
    ]
  }, {
    number: "7",
    title: t('timelineProcess.stage7'),
    description: t('timelineProcess.stage7Desc'),
    duration: t('timelineProcess.stage7Duration'),
    keyAction: t('timelineProcess.stage7Action'),
    priority: t('timelineProcess.majorMilestone'),
    icon: Archive,
    gradient: "from-rose-500 to-red-500",
    image: timeline07,
    detailedInfo: "Complete our comprehensive master data form with all required information. Our AI-assisted system helps ensure accuracy and completeness, reducing errors and processing delays.",
    keyPoints: [
      "AI-assisted data entry",
      "Comprehensive information collection",
      "Error detection and prevention",
      "Secure data storage"
    ]
  }, {
    number: "8",
    title: t('timelineProcess.stage8'),
    description: t('timelineProcess.stage8Desc'),
    duration: t('timelineProcess.stage8Duration'),
    keyAction: t('timelineProcess.stage8Action'),
    priority: t('timelineProcess.majorMilestone'),
    icon: Languages,
    gradient: "from-red-500 to-orange-500",
    image: timeline08,
    detailedInfo: "Our AI agents automatically generate all required paperwork including your citizenship application and supporting documents. Every document is reviewed by our legal experts before submission.",
    keyPoints: [
      "Automated document generation",
      "Legal expert review",
      "Compliance verification",
      "Professional formatting"
    ]
  }, {
    number: "9",
    title: t('timelineProcess.stage9'),
    description: t('timelineProcess.stage9Desc'),
    duration: t('timelineProcess.stage9Duration'),
    keyAction: t('timelineProcess.stage9Action'),
    priority: t('timelineProcess.foundationBuilding'),
    icon: Upload,
    gradient: "from-orange-500 to-amber-500",
    image: timeline09,
    detailedInfo: "Collect and submit local documents from your country of residence including birth certificates, marriage certificates, and other vital records. Our partners worldwide assist with document acquisition.",
    keyPoints: [
      "Local document guidance",
      "Partner network assistance",
      "Apostille coordination",
      "Document verification"
    ]
  }, {
    number: "10",
    title: t('timelineProcess.stage10'),
    description: t('timelineProcess.stage10Desc'),
    duration: t('timelineProcess.stage10Duration'),
    keyAction: t('timelineProcess.stage10Action'),
    priority: t('timelineProcess.majorMilestone'),
    icon: Stamp,
    gradient: "from-amber-500 to-yellow-500",
    image: timeline10,
    detailedInfo: "We conduct comprehensive searches in Polish and international archives to locate historical documents proving your Polish ancestry. Our network includes access to major archives worldwide.",
    keyPoints: [
      "Polish archive searches",
      "International archive access",
      "Historical document retrieval",
      "Expert archival research"
    ]
  }, {
    number: "11",
    title: t('timelineProcess.stage11'),
    description: t('timelineProcess.stage11Desc'),
    duration: t('timelineProcess.stage11Duration'),
    keyAction: t('timelineProcess.stage11Action'),
    priority: t('timelineProcess.majorMilestone'),
    icon: Clock,
    gradient: "from-yellow-500 to-lime-500",
    image: timeline11,
    detailedInfo: "Professional certified translation of all non-Polish documents by sworn translators. We ensure all translations meet Polish government requirements and legal standards.",
    keyPoints: [
      "Certified sworn translators",
      "Government-approved translations",
      "Quality assurance review",
      "Legal compliance verification"
    ]
  }, {
    number: "12",
    title: t('timelineProcess.stage12'),
    description: t('timelineProcess.stage12Desc'),
    duration: t('timelineProcess.stage12Duration'),
    keyAction: t('timelineProcess.stage12Action'),
    priority: t('timelineProcess.foundationBuilding'),
    icon: Zap,
    gradient: "from-lime-500 to-green-500",
    image: timeline12,
    detailedInfo: "Submit all compiled documents and application materials to the Polish authorities. We ensure everything is properly organized, complete, and meets all legal requirements.",
    keyPoints: [
      "Complete document submission",
      "Professional organization",
      "Legal compliance check",
      "Official filing confirmation"
    ]
  }, {
    number: "13",
    title: t('timelineProcess.stage13'),
    description: t('timelineProcess.stage13Desc'),
    duration: t('timelineProcess.stage13Duration'),
    keyAction: t('timelineProcess.stage13Action'),
    priority: t('timelineProcess.majorMilestone'),
    icon: Award,
    gradient: "from-green-500 to-emerald-500",
    image: timeline13,
    detailedInfo: "Receive and respond to the initial letter from Polish authorities. We analyze their requests, prepare appropriate responses, and guide you through any additional requirements.",
    keyPoints: [
      "Official response analysis",
      "Strategic response preparation",
      "Additional document coordination",
      "Timeline extension management"
    ]
  }, {
    number: "14",
    title: t('timelineProcess.stage14'),
    description: t('timelineProcess.stage14Desc'),
    duration: t('timelineProcess.stage14Duration'),
    keyAction: t('timelineProcess.stage14Action'),
    priority: t('timelineProcess.foundationBuilding'),
    icon: Shield,
    gradient: "from-emerald-500 to-teal-500",
    image: timeline14,
    detailedInfo: "Implement strategic acceleration schemes (PUSH, NUDGE, SITDOWN) to expedite your case processing. These proven methods help move your application forward more quickly.",
    keyPoints: [
      "PUSH scheme implementation",
      "NUDGE strategy execution",
      "SITDOWN meeting coordination",
      "Accelerated processing"
    ]
  }, {
    number: "15",
    title: t('timelineProcess.stage15'),
    description: t('timelineProcess.stage15Desc'),
    duration: t('timelineProcess.stage15Duration'),
    keyAction: t('timelineProcess.stage15Action'),
    priority: t('timelineProcess.foundationBuilding'),
    icon: Users,
    gradient: "from-teal-500 to-cyan-500",
    image: timeline15,
    detailedInfo: "Receive your official Polish citizenship decision. We guide you through obtaining your Polish passport and accessing extended family services to help your relatives claim citizenship.",
    keyPoints: [
      "Official citizenship confirmation",
      "Polish passport application support",
      "Extended family services",
      "EU citizenship benefits activation"
    ]
  }];

  // Auto-flip animation for first card
  useEffect(() => {
    const timer1 = setTimeout(() => {
      setFlippedCards(prev => ({ ...prev, "1": true }));
      
      const timer2 = setTimeout(() => {
        setFlippedCards(prev => ({ ...prev, "1": false }));
        setFirstCardAnimated(true);
      }, 2000);
      
      return () => clearTimeout(timer2);
    }, 500);
    
    return () => clearTimeout(timer1);
  }, []);

  const toggleFlip = (stepNumber: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };
  return (
    <section key={i18n.language} id="timeline" className="relative py-12 md:py-20 overflow-hidden overflow-x-hidden">
      <div className="container relative z-10 mx-auto px-4">
        {/* Badge - Above Title */}
        <div className="flex justify-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30">
            <Clock className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{t('timelineProcess.badge')}</span>
          </div>
        </div>
        
        {/* Title */}
        <div className="text-center mb-32">
          <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight animate-scale-in">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t('timelineProcess.title')}
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-body font-light tracking-normal mt-14">
            {t('timelineProcess.subtitle')}
          </p>
        </div>

        {/* Timeline */}
        <div className="relative max-w-5xl mx-auto mt-24">
          {/* Desktop center line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/10 via-primary/30 to-primary/10 hidden md:block" />
          
          {/* Mobile center line */}
          <div className="md:hidden absolute left-1/2 top-0 bottom-0 -translate-x-1/2">
            <div className="absolute inset-0 w-1 bg-gradient-to-b from-primary/15 via-secondary/15 to-accent/15" />
          </div>

          {timelineSteps.map((step, index) => {
            const isLeft = index % 2 === 0;
            
            return (
            <motion.div 
              key={step.number} 
              initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.03, ease: [0.25, 0.46, 0.45, 0.94] }}
              viewport={{ once: true, margin: "-200px" }}
              className={`relative mb-16 md:mb-24 flex flex-col md:flex-row items-center gap-8 ${!isLeft ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Mobile timeline dot - positioned in center */}
              <div className="md:hidden absolute left-1/2 -translate-x-1/2 z-20 -top-2">
                <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-background/20 shadow-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl font-heading font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">{parseInt(step.number)}</span>
                </div>
              </div>
              
              {/* Content Card - adjusted for mobile spacing */}
              <div className="w-full md:w-[42%] mt-20 md:mt-0">
                <div className="relative h-[320px] animate-fade-in" style={{
              perspective: '1000px',
              animationDelay: `${(index + 1) * 100}ms`
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
                    className="absolute inset-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg transition-transform duration-700"
                    style={{
                transformStyle: 'preserve-3d',
                transform: flippedCards[step.number] ? 'rotateY(180deg)' : 'rotateY(0deg)'
              }}>
                    {/* Front Side */}
                    <div className="absolute inset-0 glass-card p-5 rounded-lg hover-glow group transition-transform duration-300 hover:scale-[1.02] flex flex-col justify-center items-center" style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}>
                      <div className="flex-1 flex flex-col gap-3 justify-center items-center text-center w-full">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <span className="text-sm md:text-xs text-muted-foreground">{step.duration}</span>
                        </div>
                        <h3 className={`text-3xl md:text-3xl font-heading font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-110 transition-all duration-300 drop-shadow-lg whitespace-nowrap ${prefersReducedMotion ? '' : 'animate-fade-in'}`}>
                          {step.title}
                        </h3>
                        <p className="text-base md:text-sm text-muted-foreground mb-3 flex-1 line-clamp-3 px-2">
                          {step.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {step.keyAction}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                            {step.priority}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] md:text-xs text-muted-foreground/60 mt-5 text-center">{isMobile ? t('timelineProcess.tapToSeeDetails') : t('timelineProcess.clickToSeeDetails')}</p>
                    </div>

                    {/* Back Side */}
                    <div className="absolute inset-0 glass-card p-5 rounded-lg hover-glow flex flex-col" style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}>
                      {/* Content */}
                      <div className="flex-1 overflow-auto space-y-4">
                        <p className="text-sm text-foreground/90 leading-relaxed">
                          {step.detailedInfo}
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-2">
                          {step.keyPoints.map((point: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-primary mt-1">✓</span>
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* CTA Button */}
                      <div className="mt-4 pt-3 border-t border-border/30">
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open('https://form.typeform.com/to/QDnlB0fk', '_blank');
                          }}
                        >
                          Open Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Dot - Center Aligned */}
              <motion.div 
                className="hidden md:flex md:w-[16%] flex-shrink-0 justify-center relative z-10 items-center"
                initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-200px" }}
                transition={{ duration: 0.8, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-background/20 shadow-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl font-heading font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">{parseInt(step.number)}</span>
                </div>
              </motion.div>

              {/* Empty space for layout balance */}
              <div className="w-full md:w-[42%] hidden md:block" />
            </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex justify-center mt-16">
          <MainCTA
            onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
            ariaLabel="Take the Polish Citizenship Test to check your eligibility"
          >
            {t('hero.cta')}
          </MainCTA>
        </div>
      </div>
    </section>
  );
}