import { useState } from "react";
import { motion } from "framer-motion";
import { UserCircle } from "lucide-react";
import { MessageSquare, ClipboardCheck, FileSearch, Scale, Send, Brain, FileCheck2, Globe } from "lucide-react";
import { Button } from "./ui/button";
import { MainCTA } from "./ui/main-cta";
import { Card } from "./ui/card";

const onboardingSteps = [
  {
    number: "01",
    title: "First Contact",
    description: "Reach out through our website, email, WhatsApp, or by recommendation to start your journey.",
    icon: MessageSquare,
    gradient: "from-primary to-secondary",
    cta: "Contact Form",
    link: "#contact"
  },
  {
    number: "02",
    title: "Eligibility Check",
    description: "Take our Polish citizenship test and fill the family tree so we can determine your eligibility. If eligible, we move to the next stage.",
    icon: ClipboardCheck,
    gradient: "from-secondary to-accent",
    cta: "Take Test",
    link: "https://polishcitizenship.typeform.com/to/PS5ecU"
  },
  {
    number: "03",
    title: "Document Examination",
    description: "We carefully examine your documents, especially Polish documents of ancestors and naturalization/military service documents.",
    icon: FileSearch,
    gradient: "from-accent to-primary",
    cta: "Dashboard",
    link: "#"
  },
  {
    number: "04",
    title: "Case Assessment",
    description: "We analyze your case and provide comprehensive assessment of chances, timeline, and costs involved.",
    icon: Scale,
    gradient: "from-primary to-secondary",
    cta: "Schedule Consultation",
    link: "#contact"
  },
  {
    number: "05",
    title: "Send Documents",
    description: "Send by FedEx to our Warsaw office all required documents for processing.",
    icon: Send,
    gradient: "from-secondary to-accent",
    cta: "Dashboard",
    link: "#"
  },
  {
    number: "06",
    title: "AI Document Processing",
    description: "All documents are processed by our AI Documents System to generate Powers of Attorney and the Polish citizenship application.",
    icon: Brain,
    gradient: "from-accent to-primary",
    cta: "Dashboard",
    link: "#"
  },
  {
    number: "07",
    title: "Application Filing",
    description: "Send Powers of Attorney by FedEx to our Warsaw office. We file your citizenship application with Polish authorities.",
    icon: FileCheck2,
    gradient: "from-primary to-secondary",
    cta: "Application Generation",
    link: "#"
  },
  {
    number: "08",
    title: "Processing",
    description: "We handle all procedures simultaneously: sworn translations, archives search, Polish civil acts, and passport preparation. After about 12 months, we receive initial response from authorities.",
    icon: Globe,
    gradient: "from-secondary to-accent",
    cta: "Schedule Consultation",
    link: "#contact"
  },
];

export default function ClientOnboardingSection() {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (stepNumber: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  return (
    <section id="how-to-start" className="relative py-24 overflow-hidden overflow-x-hidden">

      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-16">
            <UserCircle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Client Journey</span>
          </div>
          <h2 className="text-5xl md:text-8xl font-heading font-black mb-14 tracking-tight animate-scale-in">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-fade-in-up glow-text drop-shadow-2xl">
              How to Become Our Client
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-16 animate-fade-in">
            Follow these 8 clear steps to become our registered client and start your citizenship case
          </p>
        </div>

        {/* Steps - Left-Right Alternating Layout */}
        <div className="relative max-w-6xl mx-auto">
          {/* Desktop center line */}
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-gradient-to-b from-primary/20 via-primary/50 to-primary/20 hidden md:block" />
          
          {/* Mobile center line */}
          <div className="md:hidden absolute left-1/2 top-0 bottom-0 -translate-x-1/2">
            <div className="absolute inset-0 w-1 bg-gradient-to-b from-primary/30 via-secondary/30 to-accent/30" />
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
                      
                      <p className="text-xs text-muted-foreground/60 text-center mt-auto">Tap to flip back</p>
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
          Take Polish Citizenship Test
        </MainCTA>
      </div>
    </section>
  );
}
