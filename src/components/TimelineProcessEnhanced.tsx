import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle, CreditCard, FileCheck, Send, FolderSearch, Archive, Languages, Upload, Stamp, Clock, Zap, Award, Book, Users, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { MainCTA } from "./ui/main-cta";
import { Card } from "./ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTranslation } from 'react-i18next';
import { LazyImage } from "./ui/lazy-image";

// Lazy-loaded timeline images - dynamically imported when needed
const getTimelineImage = (step: number): string => {
  // Use dynamic import with string templates
  return new URL(`../assets/timeline-${String(step).padStart(2, '0')}-${getStepSlug(step)}.webp`, import.meta.url).href;
};

const getStepIcon = (step: number): string => {
  return new URL(`../assets/timeline-step${step}.png`, import.meta.url).href;
};

const getStepSlug = (step: number): string => {
  const slugs = [
    'first-steps', 'terms-pricing', 'advance-account', 'poa', 'application',
    'local-docs', 'polish-docs', 'translation', 'filing', 'civil-acts',
    'initial-response', 'push-schemes', 'citizenship', 'passport', 'extended'
  ];
  return slugs[step - 1] || 'default';
};

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
    image: getTimelineImage(1),
    stepIcon: getStepIcon(1),
    detailedInfo: t('timelineProcess.stage1Details'),
    keyPoints: t('timelineProcess.stage1Points', { returnObjects: true }) as string[]
  }, {
    number: "2",
    title: t('timelineProcess.stage2'),
    description: t('timelineProcess.stage2Desc'),
    duration: t('timelineProcess.stage2Duration'),
    keyAction: t('timelineProcess.stage2Action'),
    priority: t('timelineProcess.foundationBuilding'),
    icon: CreditCard,
    gradient: "from-cyan-500 to-blue-500",
    image: getTimelineImage(2),
    stepIcon: getStepIcon(2),
    detailedInfo: t('timelineProcess.stage2Details'),
    keyPoints: t('timelineProcess.stage2Points', { returnObjects: true }) as string[]
  }, {
    number: "3",
    title: t('timelineProcess.stage3'),
    description: t('timelineProcess.stage3Desc'),
    duration: t('timelineProcess.stage3Duration'),
    keyAction: t('timelineProcess.stage3Action'),
    priority: t('timelineProcess.majorMilestone'),
    icon: CheckCircle,
    gradient: "from-blue-500 to-indigo-500",
    image: getTimelineImage(3),
    stepIcon: getStepIcon(3),
    detailedInfo: t('timelineProcess.stage3Details'),
    keyPoints: t('timelineProcess.stage3Points', { returnObjects: true }) as string[]
  }, {
    number: "4",
    title: t('timelineProcess.stage4'),
    description: t('timelineProcess.stage4Desc'),
    duration: t('timelineProcess.stage4Duration'),
    keyAction: t('timelineProcess.stage4Action'),
    priority: t('timelineProcess.foundationBuilding'),
    icon: FileCheck,
    gradient: "from-indigo-500 to-purple-500",
    image: getTimelineImage(4),
    stepIcon: getStepIcon(4),
    detailedInfo: t('timelineProcess.stage4Details'),
    keyPoints: t('timelineProcess.stage4Points', { returnObjects: true }) as string[]
  }, {
    number: "5",
    title: t('timelineProcess.stage5'),
    description: t('timelineProcess.stage5Desc'),
    duration: t('timelineProcess.stage5Duration'),
    keyAction: t('timelineProcess.stage5Action'),
    priority: t('timelineProcess.majorMilestone'),
    icon: Send,
    gradient: "from-purple-500 to-pink-500",
    image: getTimelineImage(5),
    stepIcon: getStepIcon(5),
    detailedInfo: t('timelineProcess.stage5Details'),
    keyPoints: t('timelineProcess.stage5Points', { returnObjects: true }) as string[]
  }, {
    number: "6",
    title: t('timelineProcess.stage6'),
    description: t('timelineProcess.stage6Desc'),
    duration: t('timelineProcess.stage6Duration'),
    keyAction: t('timelineProcess.stage6Action'),
    priority: t('timelineProcess.majorMilestone'),
    icon: FolderSearch,
    gradient: "from-pink-500 to-rose-500",
    image: getTimelineImage(6),
    stepIcon: getStepIcon(6),
    detailedInfo: t('timelineProcess.stage6Details'),
    keyPoints: t('timelineProcess.stage6Points', { returnObjects: true }) as string[]
  }, {
    number: "7",
    title: t('timelineProcess.stage7'),
    description: t('timelineProcess.stage7Desc'),
    duration: t('timelineProcess.stage7Duration'),
    keyAction: t('timelineProcess.stage7Action'),
    priority: t('timelineProcess.documentGathering'),
    icon: Archive,
    gradient: "from-rose-500 to-red-500",
    image: getTimelineImage(7),
    stepIcon: getStepIcon(7),
    detailedInfo: t('timelineProcess.stage7Details'),
    keyPoints: t('timelineProcess.stage7Points', { returnObjects: true }) as string[]
  }, {
    number: "8",
    title: t('timelineProcess.stage8'),
    description: t('timelineProcess.stage8Desc'),
    duration: t('timelineProcess.stage8Duration'),
    keyAction: t('timelineProcess.stage8Action'),
    priority: t('timelineProcess.documentGathering'),
    icon: Languages,
    gradient: "from-red-500 to-orange-500",
    image: getTimelineImage(8),
    stepIcon: getStepIcon(8),
    detailedInfo: t('timelineProcess.stage8Details'),
    keyPoints: t('timelineProcess.stage8Points', { returnObjects: true }) as string[]
  }, {
    number: "9",
    title: t('timelineProcess.stage9'),
    description: t('timelineProcess.stage9Desc'),
    duration: t('timelineProcess.stage9Duration'),
    keyAction: t('timelineProcess.stage9Action'),
    priority: t('timelineProcess.documentGathering'),
    icon: Upload,
    gradient: "from-orange-500 to-amber-500",
    image: getTimelineImage(9),
    stepIcon: getStepIcon(9),
    detailedInfo: t('timelineProcess.stage9Details'),
    keyPoints: t('timelineProcess.stage9Points', { returnObjects: true }) as string[]
  }, {
    number: "10",
    title: t('timelineProcess.stage10'),
    description: t('timelineProcess.stage10Desc'),
    duration: t('timelineProcess.stage10Duration'),
    keyAction: t('timelineProcess.stage10Action'),
    priority: t('timelineProcess.governmentProcessing'),
    icon: Stamp,
    gradient: "from-amber-500 to-yellow-500",
    image: getTimelineImage(10),
    stepIcon: getStepIcon(10),
    detailedInfo: t('timelineProcess.stage10Details'),
    keyPoints: t('timelineProcess.stage10Points', { returnObjects: true }) as string[]
  }, {
    number: "11",
    title: t('timelineProcess.stage11'),
    description: t('timelineProcess.stage11Desc'),
    duration: t('timelineProcess.stage11Duration'),
    keyAction: t('timelineProcess.stage11Action'),
    priority: t('timelineProcess.governmentProcessing'),
    icon: Clock,
    gradient: "from-yellow-500 to-lime-500",
    image: getTimelineImage(11),
    stepIcon: getStepIcon(11),
    detailedInfo: t('timelineProcess.stage11Details'),
    keyPoints: t('timelineProcess.stage11Points', { returnObjects: true }) as string[]
  }, {
    number: "12",
    title: t('timelineProcess.stage12'),
    description: t('timelineProcess.stage12Desc'),
    duration: t('timelineProcess.stage12Duration'),
    keyAction: t('timelineProcess.stage12Action'),
    priority: t('timelineProcess.governmentProcessing'),
    icon: Zap,
    gradient: "from-lime-500 to-green-500",
    image: getTimelineImage(12),
    stepIcon: getStepIcon(12),
    detailedInfo: t('timelineProcess.stage12Details'),
    keyPoints: t('timelineProcess.stage12Points', { returnObjects: true }) as string[]
  }, {
    number: "13",
    title: t('timelineProcess.stage13'),
    description: t('timelineProcess.stage13Desc'),
    duration: t('timelineProcess.stage13Duration'),
    keyAction: t('timelineProcess.stage13Action'),
    priority: t('timelineProcess.finalSteps'),
    icon: Award,
    gradient: "from-green-500 to-emerald-500",
    image: getTimelineImage(13),
    stepIcon: getStepIcon(13),
    detailedInfo: t('timelineProcess.stage13Details'),
    keyPoints: t('timelineProcess.stage13Points', { returnObjects: true }) as string[]
  }, {
    number: "14",
    title: t('timelineProcess.stage14'),
    description: t('timelineProcess.stage14Desc'),
    duration: t('timelineProcess.stage14Duration'),
    keyAction: t('timelineProcess.stage14Action'),
    priority: t('timelineProcess.finalSteps'),
    icon: Book,
    gradient: "from-emerald-500 to-teal-500",
    image: getTimelineImage(14),
    stepIcon: getStepIcon(14),
    detailedInfo: t('timelineProcess.stage14Details'),
    keyPoints: t('timelineProcess.stage14Points', { returnObjects: true }) as string[]
  }, {
    number: "15",
    title: t('timelineProcess.stage15'),
    description: t('timelineProcess.stage15Desc'),
    duration: t('timelineProcess.stage15Duration'),
    keyAction: t('timelineProcess.stage15Action'),
    priority: t('timelineProcess.finalSteps'),
    icon: Users,
    gradient: "from-teal-500 to-cyan-500",
    image: getTimelineImage(15),
    stepIcon: getStepIcon(15),
    detailedInfo: t('timelineProcess.stage15Details'),
    keyPoints: t('timelineProcess.stage15Points', { returnObjects: true }) as string[]
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
            
            const Icon = step.icon;
            const cardContent = (
              <>
                {/* Timeline Dot */}
                <div className="absolute left-1/2 transform -translate-x-1/2 z-10">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-r ${step.gradient} shadow-lg flex items-center justify-center border-4 border-background`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                {/* Card */}
                <div className={`w-full md:w-[42%] ${isLeft ? 'md:mr-auto md:pr-12' : 'md:ml-auto md:pl-12'}`}>
                  <div 
                    className="glass-card rounded-2xl p-6 shadow-xl border border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer h-[380px] flex flex-col"
                    onClick={() => toggleFlip(step.number)}
                  >
                    <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${step.gradient} opacity-10 blur-3xl rounded-full`} />
                    
                    <div className="relative z-10 flex-1 flex flex-col">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${step.gradient} shadow-lg`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                          {step.duration}
                        </span>
                      </div>

                      {/* Title & Priority */}
                      <h3 className="text-xl font-heading font-bold mb-2 text-foreground">
                        {step.title}
                      </h3>
                      <p className="text-xs text-primary font-medium mb-3 uppercase tracking-wider">
                        {step.priority}
                      </p>

                      {/* Description */}
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                        {step.description}
                      </p>

                      {/* Key Action */}
                      <div className="mt-auto pt-4 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-1">Key Action:</p>
                        <p className="text-sm font-medium text-foreground">{step.keyAction}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );

            return prefersReducedMotion ? (
              <div 
                key={step.number}
                className={`relative mb-40 md:mb-28 flex flex-col md:flex-row items-center gap-8 ${!isLeft ? 'md:flex-row-reverse' : ''}`}
              >
                {cardContent}
              </div>
            ) : (
              <motion.div 
                key={step.number} 
                initial={{ opacity: 0, x: isLeft ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.03, ease: [0.25, 0.46, 0.45, 0.94] as any }}
                viewport={{ once: true, margin: "-200px" }}
                className={`relative mb-40 md:mb-28 flex flex-col md:flex-row items-center gap-8 ${!isLeft ? 'md:flex-row-reverse' : ''}`}
              >
                {cardContent}
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