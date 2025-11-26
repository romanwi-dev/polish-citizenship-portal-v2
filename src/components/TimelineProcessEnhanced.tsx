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
import { TIMELINE_TRANSLATIONS, TimelineStep } from '@/i18n/timelineTranslations';

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

  // Select timeline based on language with proper fallback
  const current = i18n.language || 'en';
  const baseLang = current.split('-')[0]; // 'pt-BR' -> 'pt'
  const supported = ['en', 'es', 'pt', 'de', 'fr', 'he', 'ru', 'uk'];
  const lang = supported.includes(baseLang) ? baseLang : 'en';
  
  // Get steps from centralized translations with fallback to English
  const steps = TIMELINE_TRANSLATIONS[lang] ?? TIMELINE_TRANSLATIONS.en;

  const timelineSteps = steps.map((step, index) => ({
    number: step.number,
    title: step.title,
    description: step.description,
    duration: step.duration,
    keyAction: step.keyAction,
    priority: step.priority,
    icon: [FileText, CreditCard, CheckCircle, FileCheck, Send, FolderSearch, Archive, Languages, Upload, Stamp, Clock, Zap, Award, Book, Users][index] || Shield,
    gradient: ["from-blue-500 to-cyan-500", "from-cyan-500 to-blue-500", "from-blue-500 to-indigo-500", "from-indigo-500 to-purple-500", "from-purple-500 to-pink-500", "from-pink-500 to-rose-500", "from-rose-500 to-orange-500", "from-orange-500 to-amber-500", "from-amber-500 to-yellow-500", "from-yellow-500 to-lime-500", "from-lime-500 to-green-500", "from-green-500 to-emerald-500", "from-emerald-500 to-teal-500", "from-teal-500 to-cyan-500", "from-cyan-500 to-sky-500"][index] || "from-blue-500 to-cyan-500",
    image: getTimelineImage(index + 1),
    stepIcon: getStepIcon(index + 1),
    detailedInfo: step.detailedInfo,
    keyPoints: step.keyPoints,
    clickToSeeDetails: step.clickToSeeDetails,
    openAccountLabel: step.openAccountLabel
  }));

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
              initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.08, 
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              viewport={{ once: true, margin: "-150px" }}
              className={`relative mb-40 md:mb-28 flex flex-col md:flex-row items-center gap-8 ${!isLeft ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Mobile timeline dot - positioned in center */}
              <div className="md:hidden absolute left-1/2 -translate-x-1/2 z-20 -top-2">
                <div className="w-16 h-16 rounded-full bg-card border-2 border-border shadow-lg flex items-center justify-center">
                  <span className="text-foreground opacity-50 font-heading font-bold text-3xl">{parseInt(step.number)}</span>
                </div>
              </div>
              
              {/* Content Card - adjusted for mobile spacing */}
              <div className="w-full md:w-[42%] mt-20 md:mt-0">
                <div className="relative h-[420px] md:h-[560px] animate-fade-in" style={{
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
                    <div className="absolute inset-0 w-full h-[420px] md:h-[560px] glass-card p-4 md:p-5 rounded-lg hover-glow group transition-transform duration-300 hover:scale-[1.02] flex flex-col justify-center items-center" style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden'
                }}>
                      <div className="flex-1 flex flex-col gap-3 justify-center items-center text-center w-full">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <span className="text-sm md:text-xs text-muted-foreground">{step.duration}</span>
                        </div>
                        <h3 className={`text-3xl md:text-3xl font-heading font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-110 transition-all duration-300 drop-shadow-lg break-words leading-tight ${prefersReducedMotion ? '' : 'animate-fade-in'}`} style={{ hyphens: 'none', wordBreak: 'break-word' }}>
                          {step.title}
                        </h3>
                        <p className="text-base md:text-sm text-muted-foreground mb-3 flex-1 line-clamp-3 px-2">
                          {step.description}
                        </p>
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 break-words leading-tight" style={{ hyphens: 'none', wordBreak: 'break-word' }}>
                            {step.keyAction}
                          </span>
                          <span className="text-xs px-2 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20 break-words leading-tight" style={{ hyphens: 'none', wordBreak: 'break-word' }}>
                            {step.priority}
                          </span>
                        </div>
                      </div>
                      <p className="text-[10px] md:text-xs text-muted-foreground/60 mt-5 text-center">{step.clickToSeeDetails || (isMobile ? t('timelineProcess.tapToSeeDetails') : t('timelineProcess.clickToSeeDetails'))}</p>
                    </div>

                    {/* Back Side */}
                    <div className="absolute inset-0 w-full h-[420px] md:h-[560px] glass-card p-4 md:p-5 rounded-lg hover-glow flex flex-col overflow-y-auto" style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)'
                }}>
                      {/* Content */}
                      <div className="flex-1 space-y-3 md:space-y-4">
                        <p className="text-xs md:text-sm text-foreground/90 leading-relaxed break-words" style={{ hyphens: 'none', wordBreak: 'break-word' }}>
                          {step.detailedInfo}
                        </p>
                        <ul className="text-[11px] md:text-xs text-muted-foreground space-y-2">
                          {step.keyPoints.map((point: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-primary mt-1 flex-shrink-0">✓</span>
                              <span className="break-words" style={{ hyphens: 'none', wordBreak: 'break-word' }}>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* CTA Button */}
                      <div className="mt-3 md:mt-4 pt-2 md:pt-3 border-t border-border/30">
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full text-xs md:text-sm py-2 break-words leading-tight"
                          style={{
                            fontSize: 'clamp(0.7rem, 2.5vw, 0.875rem)',
                            padding: 'clamp(0.4rem, 1.5vw, 0.65rem) clamp(0.6rem, 2.5vw, 1.25rem)',
                            hyphens: 'none',
                            wordBreak: 'break-word'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          <span className="block w-full break-words" style={{ hyphens: 'none', wordBreak: 'break-word' }}>{step.openAccountLabel || t('timelineProcess.openAccountCta')}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Dot - Center Aligned */}
              <motion.div 
                className="hidden md:flex md:w-[16%] flex-shrink-0 justify-center relative z-10 items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-150px" }}
                transition={{ duration: 0.6, delay: index * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <div className="w-16 h-16 rounded-full bg-card border-2 border-border shadow-lg flex items-center justify-center">
                  <span className="text-foreground opacity-50 font-heading font-bold text-3xl">{parseInt(step.number)}</span>
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