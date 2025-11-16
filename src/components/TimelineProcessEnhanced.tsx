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
    detailedInfo: "Your journey begins with the initial contact where you reach out to express your interest in Polish citizenship. During this phase, you'll engage in preliminary communication to understand your unique situation and family background. We'll answer your initial questions and guide you toward the next steps in your citizenship application process.",
    keyPoints: [
      "Your first inquiry initiates the citizenship journey",
      "Your questions receive preliminary answers",
      "Your case is evaluated for eligibility",
      "Your next steps are clearly outlined"
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
    detailedInfo: "Your citizenship eligibility is assessed through a comprehensive citizenship test. This detailed examination analyzes your family history, ancestral connections, and documentation to determine your qualification for Polish citizenship by descent. The test reveals exactly which documents you need and what path your application will follow.",
    keyPoints: [
      "Your family history receives thorough analysis",
      "Your ancestral line is verified for citizenship eligibility",
      "Your required documents are identified",
      "Your citizenship path is mapped out clearly"
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
    detailedInfo: "Your complete family tree is professionally constructed, tracing your lineage back through multiple generations to establish your Polish ancestry. This genealogical research identifies the key Polish ancestor through whom you claim citizenship and documents the unbroken chain of descent that qualifies you for citizenship recognition.",
    keyPoints: [
      "Your ancestral line is professionally researched",
      "Your family tree is documented with historical records",
      "Your key Polish ancestor is identified and verified",
      "Your citizenship chain is established and proven"
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
    detailedInfo: "Your eligibility confirmation is followed by a detailed discussion about the terms and pricing for your citizenship case. You'll receive a transparent breakdown of all costs, a clear explanation of the service agreement, and the complete list of documents required for your specific case. This stage ensures you understand exactly what's needed and what you'll receive.",
    keyPoints: [
      "Your pricing is presented with complete transparency",
      "Your service terms are explained in detail",
      "Your required documents are listed specifically",
      "Your questions about costs are answered fully"
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
    detailedInfo: "Your case officially begins when you make your advance payment and your secure account is created on our client portal. This payment confirms your commitment and activates all services. Your portal account gives you 24/7 access to track progress, upload documents, and communicate with your legal team throughout the entire citizenship process.",
    keyPoints: [
      "Your advance payment secures your case slot",
      "Your portal account provides real-time tracking",
      "Your documents can be uploaded securely",
      "Your legal team becomes directly accessible"
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
    detailedInfo: "Your essential details are collected through our comprehensive intake process where you provide passport information, birth details, address, phone number, and key family history. This information forms the foundation for preparing your Power of Attorney documents, which will authorize us to represent you in all dealings with Polish authorities.",
    keyPoints: [
      "Your personal information is securely collected",
      "Your passport details are recorded accurately",
      "Your family data is documented for POA preparation",
      "Your authorization forms are prepared professionally"
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
    detailedInfo: "Your Power of Attorney documents are professionally prepared by our legal team, then emailed to you for signature. After you sign these critical documents, you'll send them via FedEx to our Warsaw office. These POAs legally authorize us to act on your behalf with Polish government agencies, submit applications, and handle all official correspondence throughout your citizenship case.",
    keyPoints: [
      "Your POA documents are drafted by legal experts",
      "Your signatures are collected on official forms",
      "Your signed POAs are shipped securely to Warsaw",
      "Your legal representation is officially established"
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
    detailedInfo: "Your master data form is completed through our comprehensive digital interface where you provide all necessary information about yourself and your family. This detailed form, containing approximately 140 fields, captures everything needed for your citizenship application. Our AI-powered system helps ensure accuracy and completeness as you fill in dates, places, names, and family relationships.",
    keyPoints: [
      "Your complete family information is systematically collected",
      "Your data is validated for accuracy by AI assistance",
      "Your application becomes ready for official submission",
      "Your information is securely stored in your portal"
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
    detailedInfo: "Your local documents from your country of residence are gathered and submitted, including birth certificates, marriage certificates, naturalization records, and other vital documents. Our global partner network assists you in obtaining these documents from local authorities. Each document must be properly certified, apostilled, and prepared for submission to Polish authorities.",
    keyPoints: [
      "Your local birth and marriage certificates are obtained",
      "Your documents receive apostille certification as required",
      "Your partner assistance is arranged when needed",
      "Your vital records are verified for authenticity"
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
    detailedInfo: "Your Polish archival documents are professionally searched for and retrieved from archives across Poland and internationally. Our expert researchers access birth, marriage, and death records from Polish state archives, church archives, and international repositories. These historical documents are crucial evidence of your Polish ancestry and citizenship chain.",
    keyPoints: [
      "Your ancestral documents are located in Polish archives",
      "Your church and civil records are professionally retrieved",
      "Your international archives are searched when applicable",
      "Your historical proof of Polish connection is secured"
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
    detailedInfo: "Your non-Polish documents undergo professional certified translation by Polish sworn translators. Every birth certificate, marriage record, and legal document not in Polish must be translated by a certified sworn translator whose work is recognized by Polish authorities. Our translation partners ensure accuracy and legal compliance with strict government requirements.",
    keyPoints: [
      "Your documents are translated by certified sworn translators",
      "Your translations meet official Polish legal standards",
      "Your translated documents include required certifications",
      "Your translation quality is verified for accuracy"
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
    detailedInfo: "Your complete documentation package is professionally filed with the Polish authorities. All your collected documents—local certificates, Polish archival records, certified translations, and your application—are organized, verified, and submitted to the Masovian Voivodeship office. Your filing is tracked and you receive confirmation of official submission.",
    keyPoints: [
      "Your complete document set is organized professionally",
      "Your application is submitted to the correct authority",
      "Your filing is confirmed with official receipt",
      "Your case enters the government review queue"
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
    detailedInfo: "Your Polish civil acts are obtained from Polish registry offices, providing you with official Polish birth and marriage certificates. After your application is filed, you can request these documents which serve as official Polish records. The process involves applications to specific civil registry offices, payment of fees, and professional coordination to receive these important Polish documents.",
    keyPoints: [
      "Your Polish birth certificate is obtained from registry",
      "Your Polish marriage certificate is requested if applicable",
      "Your civil acts fees are processed",
      "Your official Polish documents are delivered"
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
    detailedInfo: "Your initial response arrives from the Polish government, typically 10-18 months after submission. This letter may request additional evidence, clarifications, or documents to support your claim. Our team analyzes every requirement, explains what's needed, and coordinates the response. We can also implement acceleration strategies like PUSH, NUDGE, or SIT-DOWN to expedite your case.",
    keyPoints: [
      "Your government letter is received and analyzed",
      "Your required additional evidence is identified",
      "Your acceleration options are presented (PUSH/NUDGE/SIT-DOWN)",
      "Your response strategy is professionally coordinated"
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
    detailedInfo: "Your citizenship decision is officially confirmed by the Polish government, recognizing your Polish citizenship status. Upon receiving this positive decision, your Polish passport application process begins. We prepare all necessary documents, schedule your consulate appointment, and guide you through obtaining your Polish passport—the final step in your citizenship journey.",
    keyPoints: [
      "Your citizenship is officially confirmed by decision",
      "Your Polish passport documents are prepared",
      "Your consulate appointment is scheduled",
      "Your Polish passport is issued to complete the process"
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
              className={`relative mb-40 md:mb-28 flex flex-col md:flex-row items-center gap-8 ${!isLeft ? 'md:flex-row-reverse' : ''}`}
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
                    <div className="absolute inset-0 w-full h-[480px] glass-card p-5 rounded-lg hover-glow group transition-transform duration-300 hover:scale-[1.02] flex flex-col justify-center items-center" style={{
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
                    <div className="absolute inset-0 w-full h-[480px] glass-card p-5 rounded-lg hover-glow flex flex-col" style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}>
                      {/* Content */}
                      <div className="flex-1 space-y-4">
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