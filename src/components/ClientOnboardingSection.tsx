import { useState } from "react";
import { motion } from "framer-motion";
import { UserCircle } from "lucide-react";
import { MessageSquare, ClipboardCheck, FileSearch, Scale, Send } from "lucide-react";
import { Button } from "./ui/button";
import { MainCTA } from "./ui/main-cta";
import { Card } from "./ui/card";
import { useTranslation } from 'react-i18next';
import { SectionLayout } from "./layout/SectionLayout";

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
      link: "#contact"
    },
    {
      number: t('onboarding.step2Number'),
      title: t('onboarding.step2Title'),
      description: t('onboarding.step2Desc'),
      icon: ClipboardCheck,
      gradient: "from-secondary to-accent",
      cta: t('onboarding.step2Cta'),
      link: "https://polishcitizenship.typeform.com/to/PS5ecU"
    },
    {
      number: t('onboarding.step3Number'),
      title: t('onboarding.step3Title'),
      description: t('onboarding.step3Desc'),
      icon: FileSearch,
      gradient: "from-accent to-primary",
      cta: t('onboarding.step3Cta'),
      link: "#"
    },
    {
      number: t('onboarding.step4Number'),
      title: t('onboarding.step4Title'),
      description: t('onboarding.step4Desc'),
      icon: Scale,
      gradient: "from-primary to-secondary",
      cta: t('onboarding.step4Cta'),
      link: "#contact"
    },
    {
      number: t('onboarding.step5Number'),
      title: t('onboarding.step5Title'),
      description: t('onboarding.step5Desc'),
      icon: Send,
      gradient: "from-secondary to-accent",
      cta: t('onboarding.step5Cta'),
      link: "#"
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
              className={`mb-16 last:mb-0 ${index === 0 ? 'mt-8 md:mt-16' : ''} relative`}
            >
              {/* Mobile timeline dot - positioned in center */}
              <div className="md:hidden absolute left-1/2 -translate-x-1/2 z-20 -top-2">
                <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-background/20 shadow-lg flex items-center justify-center backdrop-blur-sm">
                  <span className="text-2xl font-heading font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">{parseInt(step.number)}</span>
                </div>
              </div>
              
              <div className={`flex flex-col md:${isLeft ? 'flex-row' : 'flex-row-reverse'} gap-4 md:gap-12 items-center`}>
                {/* Card - adjusted for mobile spacing */}
                <div className="w-full md:w-[42%] mt-20 md:mt-0">
                  <div 
                    className="relative h-[520px]"
                    style={{ 
                      perspective: '1000px'
                    }}
                  >
                <div
                  onClick={() => toggleFlip(step.number)}
                  className="absolute inset-0 cursor-pointer transition-transform duration-700"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: flippedCards[step.number] ? 'rotateY(180deg)' : 'rotateY(0deg)'
                  }}
                >
                  {/* Front Side */}
                  <div
                    className="absolute inset-0 glass-card p-8 rounded-lg hover-glow group transition-transform duration-300 hover:scale-[1.03] hover:-translate-y-1 flex flex-col justify-center items-center"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                  >
                    {/* Icon */}
                    <div className="mb-6 relative flex items-center justify-center w-full">
                      <div className="w-full h-32 rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
                        <step.icon className="w-16 h-16 text-primary opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-4 text-center w-full">
                      <h3 className="text-3xl md:text-3xl font-heading font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                        {step.title}
                      </h3>
                      <p className="text-base md:text-sm text-muted-foreground leading-relaxed px-2">
                        {step.description}
                      </p>
                    </div>
                    
                    <div className="mt-auto mb-6 flex justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-48"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (step.link.startsWith('#')) {
                            document.querySelector(step.link)?.scrollIntoView({ behavior: 'smooth' });
                          } else if (step.link.startsWith('http')) {
                            window.open(step.link, '_blank');
                          }
                        }}
                      >
                        {step.cta} →
                      </Button>
                    </div>
                    <p className="text-[10px] md:text-xs text-muted-foreground/60 text-center">Tap card for details</p>
                  </div>

                  {/* Back Side */}
                  <div 
                    className="absolute inset-0 glass-card p-6 rounded-lg hover-glow flex flex-col"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    {/* Illustration */}
                    <div className="w-full h-24 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-secondary/10 to-accent/10 flex items-center justify-center">
                      <step.icon className="w-12 h-12 text-secondary opacity-80" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 overflow-auto space-y-3">
                      <h3 className="text-lg font-heading font-bold tracking-tight text-card-foreground">
                        {step.title} - What to Expect
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        In this step, we {step.description.toLowerCase()}. Our team ensures everything is handled professionally and efficiently.
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-card-foreground">Key Points:</p>
                        <ul className="text-xs text-muted-foreground/80 space-y-1.5 pl-4">
                          <li className="flex items-start gap-2">
                            <span className="text-secondary mt-0.5">✓</span>
                            <span>Fast and reliable service</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-secondary mt-0.5">✓</span>
                            <span>Expert legal guidance</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="text-secondary mt-0.5">✓</span>
                            <span>Transparent communication</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    
                    {/* CTA Button */}
                    <div className="mt-4 pt-3 border-t border-border/30">
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank');
                        }}
                      >
                        Create Account & Learn More →
                      </Button>
                      <p className="text-[10px] md:text-xs text-muted-foreground/60 text-center mt-2">Tap card to flip back</p>
                    </div>
                  </div>
                  </div>
                  </div>
                </div>

                {/* Timeline Dot - Center Aligned */}
                <motion.div 
                  className="hidden md:flex md:w-[16%] flex-shrink-0 justify-center relative z-10 items-center"
                  initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-background/20 shadow-lg flex items-center justify-center backdrop-blur-sm">
                    <span className="text-2xl font-heading font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">{parseInt(step.number)}</span>
                  </div>
                </motion.div>

                {/* Empty space on other side */}
                <div className="hidden md:block md:w-[42%]" />
              </div>
            </div>
            );
          })}
        </div>
    </SectionLayout>
  );
}
