import { useState } from "react";
import { motion } from "framer-motion";
import { UserCircle } from "lucide-react";
import { MessageSquare, ClipboardCheck, FileSearch, Scale, Send } from "lucide-react";
import { Button } from "./ui/button";
import { MainCTA } from "./ui/main-cta";
import { Card } from "./ui/card";
import { useTranslation } from 'react-i18next';
import { SectionLayout } from "./layout/SectionLayout";
import consultationImg from "@/assets/onboarding-consultation.png";
import reviewImg from "@/assets/onboarding-review.png";
import agreementImg from "@/assets/onboarding-agreement.png";
import initiationImg from "@/assets/onboarding-initiation.png";

// StepIllustration component for desktop step illustrations
interface StepIllustrationProps {
  step: number;
}

const StepIllustration = ({ step }: StepIllustrationProps) => {
  const imageMap: Record<number, { src: string; alt: string }> = {
    1: { src: '/steps/step1-contact.png – avatar + speech bubble.png', alt: 'First Contact - 3D avatar with speech bubble' },
    2: { src: '/steps/step2-eligibility.png – document + magnifying glass + check.png', alt: 'Eligibility Check - 3D document with magnifying glass and checkmark' },
    3: { src: '/steps/step3-documents.png – folder stack.png', alt: 'Documents & POAs - 3D stack of folders' },
    4: { src: '/steps/step4-assessment.png – checklist + bar chart.png', alt: 'Case Assessment - 3D checklist with checks and circular bar chart' },
    5: { src: '/steps/step5-send.png – FedEx-style envelope + pin.png', alt: 'Send Documents to Warsaw - 3D FedEx-style glowing envelope with location pin' },
  };

  const image = imageMap[step];
  if (!image) return null;

  // Encode the URL to handle special characters in filenames
  const encodedSrc = image.src.split('/').map((part, index) => 
    index === 0 ? part : encodeURIComponent(part)
  ).join('/');

  return (
    <img
      src={encodedSrc}
      alt={image.alt}
      width={320}
      height={320}
      className="w-72 lg:w-80 h-auto opacity-70 xl:opacity-60 pointer-events-none select-none"
      loading="lazy"
      style={{ mixBlendMode: 'normal' }}
    />
  );
};

export default function ClientOnboardingSection() {
  const { t } = useTranslation();
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (stepNumber: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  const onboardingSteps = [
    {
      number: t('onboarding.step1Number'),
      title: t('onboarding.step1Title'),
      description: t('onboarding.step1Desc'),
      icon: MessageSquare,
      gradient: "from-primary to-secondary",
      cta: t('onboarding.step1Cta'),
      link: "#contact",
      illustration: consultationImg,
      detailedInfo: t('onboarding.step1DetailedInfo'),
      keyPoints: t('onboarding.step1KeyPoints', { returnObjects: true }) as string[]
    },
    {
      number: t('onboarding.step2Number'),
      title: t('onboarding.step2Title'),
      description: t('onboarding.step2Desc'),
      icon: ClipboardCheck,
      gradient: "from-secondary to-accent",
      cta: t('onboarding.step2Cta'),
      link: "https://polishcitizenship.typeform.com/to/PS5ecU",
      illustration: reviewImg,
      detailedInfo: t('onboarding.step2DetailedInfo'),
      keyPoints: t('onboarding.step2KeyPoints', { returnObjects: true }) as string[]
    },
    {
      number: t('onboarding.step3Number'),
      title: t('onboarding.step3Title'),
      description: t('onboarding.step3Desc'),
      icon: FileSearch,
      gradient: "from-accent to-primary",
      cta: t('onboarding.step3Cta'),
      link: "#",
      illustration: agreementImg,
      detailedInfo: t('onboarding.step3DetailedInfo'),
      keyPoints: t('onboarding.step3KeyPoints', { returnObjects: true }) as string[]
    },
    {
      number: t('onboarding.step4Number'),
      title: t('onboarding.step4Title'),
      description: t('onboarding.step4Desc'),
      icon: Scale,
      gradient: "from-primary to-secondary",
      cta: t('onboarding.step4Cta'),
      link: "#contact",
      illustration: initiationImg,
      detailedInfo: t('onboarding.step4DetailedInfo'),
      keyPoints: t('onboarding.step4KeyPoints', { returnObjects: true }) as string[]
    },
    {
      number: t('onboarding.step5Number'),
      title: t('onboarding.step5Title'),
      description: t('onboarding.step5Desc'),
      icon: Send,
      gradient: "from-secondary to-accent",
      cta: t('onboarding.step5Cta'),
      link: "#",
      illustration: reviewImg,
      detailedInfo: t('onboarding.step5DetailedInfo'),
      keyPoints: t('onboarding.step5KeyPoints', { returnObjects: true }) as string[]
    }
  ];

  return (
    <SectionLayout
      id="how-to-start"
      badge={{ icon: UserCircle, text: t('onboarding.badge') }}
      title={t('onboarding.title')}
      subtitle={t('onboarding.description')}
      cta={
        <MainCTA 
          onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
          ariaLabel="Take the Polish Citizenship Test"
        >
          {t('hero.cta')}
        </MainCTA>
      }
    >
      {/* Steps - Left-Right Alternating Layout */}
      <div className="relative max-w-6xl mx-auto">
          {/* Desktop center line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/10 via-primary/30 to-primary/10 hidden md:block" />
          
          {/* Mobile center line */}
          <div className="md:hidden absolute left-1/2 top-0 bottom-0 -translate-x-1/2">
            <div className="absolute inset-0 w-1 bg-gradient-to-b from-primary/15 via-secondary/15 to-accent/15" />
          </div>

          {onboardingSteps.map((step, index) => {
            const isLeft = index % 2 === 0;
            
            return (
            <div
              key={step.number}
              className={`mb-24 sm:mb-32 md:mb-28 last:mb-0 ${index === 0 ? 'mt-6 sm:mt-8 md:mt-16' : ''} relative`} /* ONBOARDING-UX-SAFE: Tighter spacing on mobile */
            >
              {/* Mobile timeline dot - positioned in center */}
              <div className="md:hidden absolute left-1/2 -translate-x-1/2 z-20 -top-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-card border-2 border-border shadow-lg flex items-center justify-center"> {/* ONBOARDING-UX-SAFE: Slightly smaller on small mobile */}
                  <span className="text-foreground opacity-50 font-heading font-bold text-2xl sm:text-3xl">{parseInt(step.number)}</span> {/* ONBOARDING-UX-SAFE: Responsive font size */}
                </div>
              </div>
              
              <div className={`flex flex-col md:${isLeft ? 'flex-row' : 'flex-row-reverse'} gap-3 sm:gap-4 md:gap-10 lg:gap-12 items-center`}> {/* ONBOARDING-UX-SAFE: Tighter gap on mobile */}
                {/* Card - adjusted for mobile spacing */}
                <div className="w-full md:w-[42%] mt-16 sm:mt-20 md:mt-0"> {/* ONBOARDING-UX-SAFE: Reduced top margin on small mobile */}
                  <div 
                    className="relative h-[380px] sm:h-[420px] md:h-[560px]" /* ONBOARDING-UX-SAFE: Shorter card on mobile to prevent scrolling */
                    style={{ 
                      perspective: '1000px'
                    }}
                  >
                <div
                  onClick={() => toggleFlip(step.number)}
                  className="absolute inset-0 cursor-pointer transition-transform duration-700 ease-out" /* ONBOARDING-UX-SAFE: Smoother flip animation */
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: flippedCards[step.number] ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* Front Side */}
                  <div
                    className="absolute inset-0 w-full h-[380px] sm:h-[420px] md:h-[560px] glass-card p-3 sm:p-4 md:p-8 rounded-lg hover-glow group transition-transform duration-300 ease-out hover:scale-[1.03] hover:-translate-y-1 flex flex-col justify-center items-center" /* ONBOARDING-UX-SAFE: Responsive height + padding + smoother animation */
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                  >
                    {/* Icon */}
                    <div className="mb-4 sm:mb-6 relative flex items-center justify-center w-full"> {/* ONBOARDING-UX-SAFE: Tighter margin on mobile */}
                      <div className="w-full h-24 sm:h-32 rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center"> {/* ONBOARDING-UX-SAFE: Shorter on mobile */}
                        <step.icon className="w-12 h-12 sm:w-16 sm:h-16 text-primary opacity-80 group-hover:opacity-100 transition-opacity duration-300 ease-out" /> {/* ONBOARDING-UX-SAFE: Responsive icon size + smoother animation */}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-3 sm:space-y-4 text-center w-full"> {/* ONBOARDING-UX-SAFE: Tighter spacing on mobile */}
                      <h3 className="text-2xl sm:text-3xl md:text-3xl font-heading font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300 ease-out break-words leading-tight line-clamp-3" style={{ hyphens: 'none', wordBreak: 'break-word' }}> {/* ONBOARDING-UX-SAFE: Responsive text + line clamp + smoother animation */}
                        {step.title}
                      </h3>
                      <p className="text-sm sm:text-base md:text-sm text-muted-foreground leading-relaxed px-1 sm:px-2 line-clamp-4"> {/* ONBOARDING-UX-SAFE: Responsive text + padding + line clamp */}
                        {step.description}
                      </p>
                    </div>
                    
                    <div className="mt-4 sm:mt-8"></div> {/* ONBOARDING-UX-SAFE: Tighter spacing on mobile */}
                    <p className="text-[10px] md:text-xs text-muted-foreground/60 text-center truncate">{t('onboarding.tapForDetails')}</p> {/* ONBOARDING-UX-SAFE: Truncate to prevent overflow */}
                  </div>

                  {/* Back Side */}
                  <div 
                    className="absolute inset-0 w-full h-[380px] sm:h-[420px] md:h-[560px] glass-card p-3 sm:p-4 md:p-6 rounded-lg hover-glow flex flex-col overflow-y-auto" /* ONBOARDING-UX-SAFE: Responsive height + padding */
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    {/* Content */}
                    <div className="flex-1 space-y-3 sm:space-y-4"> {/* ONBOARDING-UX-SAFE: Tighter spacing on mobile */}
                      <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed break-words" style={{ hyphens: 'none', wordBreak: 'break-word' }}> {/* ONBOARDING-UX-SAFE: Smaller text on mobile */}
                        {step.detailedInfo}
                      </p>
                      <div className="space-y-1.5 sm:space-y-2"> {/* ONBOARDING-UX-SAFE: Tighter spacing on mobile */}
                        <ul className="text-[11px] sm:text-xs text-muted-foreground space-y-1.5 sm:space-y-2"> {/* ONBOARDING-UX-SAFE: Smaller text + tighter spacing */}
                          {step.keyPoints.map((point: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-primary mt-0.5 flex-shrink-0">✓</span> {/* ONBOARDING-UX-SAFE: Prevent checkmark from shrinking */}
                              <span className="break-words" style={{ hyphens: 'none', wordBreak: 'break-word' }}>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    
                    {/* CTA Button */}
                    <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-border/30"> {/* ONBOARDING-UX-SAFE: Tighter spacing on mobile */}
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full break-words leading-tight min-h-[44px]" /* ONBOARDING-UX-SAFE: Minimum touch target */
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
                        {t('onboarding.openAccountCta')}
                      </Button>
                    </div>
                  </div>
                  </div>
                  </div>
                </div>

                {/* Timeline Dot - Center Aligned */}
                <div className="hidden md:flex md:w-[16%] flex-shrink-0 justify-center relative z-10 items-center">
                  <div className="w-16 h-16 rounded-full bg-card border-2 border-border shadow-lg flex items-center justify-center transition-transform duration-300 ease-out hover:scale-110"> {/* ONBOARDING-UX-SAFE: Add hover effect */}
                    <span className="text-foreground opacity-50 font-heading font-bold text-3xl">{parseInt(step.number)}</span>
                  </div>
                </div>

                {/* Step Illustration - Desktop only */}
                <div className={`hidden lg:flex lg:w-[42%] items-center ${isLeft ? 'justify-start pl-8' : 'justify-end pr-8'}`}>
                  <StepIllustration step={index + 1} />
                </div>
              </div>
            </div>
            );
          })}
        </div>
    </SectionLayout>
  );
}
