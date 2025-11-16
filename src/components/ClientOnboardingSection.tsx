import { useState } from "react";
import { motion } from "framer-motion";
import { UserCircle } from "lucide-react";
import { MessageSquare, ClipboardCheck, FileSearch, Scale, Send, Brain, FileCheck2, Globe } from "lucide-react";
import { Button } from "./ui/button";
import { MainCTA } from "./ui/main-cta";
import { Card } from "./ui/card";
import { useTranslation } from 'react-i18next';

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
    <section id="how-to-start" className="relative py-24 overflow-hidden overflow-x-hidden">

      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6 border border-primary/30">
            <UserCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{t('onboarding.badge')}</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-heading font-black mb-6 tracking-tight animate-scale-in">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t('onboarding.title')}
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-body font-light tracking-normal">
            {t('onboarding.description')}
          </p>
        </div>

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
            <motion.div
              key={step.number}
              initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              viewport={{ once: true, margin: "-200px" }}
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
                    className="relative h-[520px] animate-fade-in"
                    style={{ 
                      perspective: '1000px',
                      animationDelay: `${(index + 1) * 100}ms`
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
                      <p className="text-sm text-muted-foreground leading-relaxed px-2">
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
                    <p className="text-xs text-muted-foreground/60 text-center">Tap card for details</p>
                  </div>

                  {/* Back Side */}
                  <div 
                    className="absolute inset-0 glass-card p-8 rounded-lg hover-glow flex flex-col"
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
                        Additional Information
                      </h3>
                      <div className="flex-1 overflow-auto">
                        <p className="text-sm text-muted-foreground italic">
                          [Admin: Add detailed information about {step.title} here. This section can include specific requirements, documents needed, timelines, tips, or important notes that clients should know about this step.]
                        </p>
                      </div>
                    </div>
                      
                      <p className="text-xs text-muted-foreground/60 text-center mt-auto">{t('onboarding.flipBack')}</p>
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
            </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <MainCTA
          wrapperClassName="mt-40 mb-20"
          onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
          ariaLabel="Take the Polish Citizenship Test to check your eligibility"
        >
          {t('hero.cta')}
        </MainCTA>
      </div>
    </section>
  );
}
