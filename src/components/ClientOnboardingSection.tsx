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
      detailedInfo: "Your citizenship journey begins with your first contact. Reach out to us through our website contact form, email, WhatsApp, or through a personal recommendation. This initial connection starts the conversation about your Polish ancestry and citizenship eligibility. We'll provide preliminary information and guide you toward the next step in the process.",
      keyPoints: [
        "Contact us via website, email, WhatsApp, or recommendation",
        "Share your initial questions about Polish citizenship",
        "Receive preliminary guidance about the process",
        "Learn about the next steps in your journey"
      ]
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
      detailedInfo: "Take our comprehensive Polish citizenship test and fill out the family tree form to help us determine your eligibility. Our system analyzes your family history, ancestry line, and documentation to assess whether you qualify for Polish citizenship. If eligible based on this initial assessment, we'll move forward to the detailed document examination stage.",
      keyPoints: [
        "Complete our Polish citizenship eligibility test online",
        "Fill out detailed family tree with ancestor information",
        "Receive initial eligibility assessment based on your responses",
        "If eligible, proceed to next stage of document examination"
      ]
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
      detailedInfo: "We carefully examine all your documents, with special attention to Polish documents of your ancestors and any naturalization or military service records. This thorough examination verifies document authenticity, identifies any missing pieces, and ensures we have everything needed for a strong citizenship application. We analyze historical records to build your complete ancestry case.",
      keyPoints: [
        "Detailed examination of Polish ancestor documents",
        "Special focus on naturalization and military service records",
        "Verification of document authenticity and completeness",
        "Identification of any additional documentation needed"
      ]
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
      detailedInfo: "We analyze your complete case and provide a comprehensive assessment of your citizenship chances, realistic timeline expectations, and detailed breakdown of all costs involved. This professional evaluation gives you a clear picture of what to expect, including success probability, estimated processing duration, and transparent pricing for our services.",
      keyPoints: [
        "Comprehensive analysis of your citizenship chances",
        "Realistic timeline estimate for your specific case",
        "Detailed cost breakdown with transparent pricing",
        "Professional assessment report with recommendations"
      ]
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
      detailedInfo: "Once ready, send all required documents by FedEx to our Warsaw office for processing. Our team receives and securely handles your original documents, including birth certificates, marriage records, passports, and any Polish ancestor documents. All materials are carefully cataloged and prepared for the next stages of your citizenship application.",
      keyPoints: [
        "Send all required documents via FedEx to Warsaw office",
        "Secure handling of original birth, marriage, and ancestor documents",
        "Professional cataloging and organization of all materials",
        "Documents prepared for AI processing and application filing"
      ]
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
              className={`mb-32 md:mb-28 last:mb-0 ${index === 0 ? 'mt-8 md:mt-16' : ''} relative`}
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
                    className="relative h-[440px]"
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
                    className="absolute inset-0 w-full h-[440px] glass-card p-8 rounded-lg hover-glow group transition-transform duration-300 hover:scale-[1.03] hover:-translate-y-1 flex flex-col justify-center items-center"
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
                    className="absolute inset-0 w-full h-[440px] glass-card p-6 rounded-lg hover-glow flex flex-col"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    {/* Content */}
                    <div className="flex-1 space-y-4">
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        {step.detailedInfo}
                      </p>
                      <div className="space-y-2">
                        <ul className="text-xs text-muted-foreground space-y-2">
                          {step.keyPoints.map((point: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-primary mt-1">✓</span>
                              <span>{point}</span>
                            </li>
                          ))}
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
                          window.location.href = '/request-access';
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
