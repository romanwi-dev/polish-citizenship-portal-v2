import { useState } from "react";
import { UserCircle } from "lucide-react";
import { MessageSquare, ClipboardCheck, FileSearch, Scale, Send, Brain, FileCheck2, Globe } from "lucide-react";
import { Button } from "./ui/button";
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

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {onboardingSteps.map((step, index) => (
            <div
              key={step.number}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div 
                className="relative h-[450px]"
                style={{ perspective: '1000px' }}
              >
                <div
                  onClick={() => toggleFlip(step.number)}
                  className="absolute inset-0 cursor-pointer transition-transform duration-700"
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: flippedCards[step.number] ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  }}
                >
                  {/* Front Side */}
                  <div
                    className="absolute inset-0 glass-card p-8 rounded-lg hover-glow group transition-transform duration-300 hover:scale-[1.03] hover:-translate-y-1"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                    }}
                  >
                    {/* Icon and Number */}
                    <div className="mb-6 relative">
                      <div className="w-full h-32 rounded-lg overflow-hidden bg-gradient-to-br from-primary/5 to-secondary/5 flex items-center justify-center">
                        <step.icon className="w-16 h-16 text-primary opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      <div className={`absolute top-4 left-4 text-5xl font-heading font-black bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent opacity-20`}>
                        {step.number}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                      <h3 className="text-2xl md:text-3xl font-heading font-black tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
                        {step.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        {step.description}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
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
                      <p className="text-xs text-muted-foreground/60 text-center mt-2">Tap card for details</p>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div 
                    className="absolute inset-0 glass-card p-8 rounded-lg hover-glow"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <div className="flex flex-col gap-4 h-full">
                      <div className="mb-4 relative">
                        <div className="w-full h-32 rounded-lg overflow-hidden bg-gradient-to-br from-secondary/5 to-accent/5 flex items-center justify-center">
                          <step.icon className="w-16 h-16 text-secondary opacity-60" />
                        </div>
                        <div className={`absolute top-4 left-4 text-5xl font-heading font-black bg-gradient-to-r ${step.gradient} bg-clip-text text-transparent opacity-20`}>
                          {step.number}
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-heading font-bold tracking-tight text-card-foreground mb-2">
                        Additional Information
                      </h3>
                      <div className="flex-1 overflow-auto">
                        <p className="text-sm text-muted-foreground italic">
                          [Admin: Add detailed information about {step.title} here. This section can include specific requirements, documents needed, timelines, tips, or important notes that clients should know about this step.]
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground/60 text-center">Tap to flip back</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <Button
            size="lg"
            className="text-lg md:text-2xl font-bold px-8 py-4 md:px-20 md:py-6 h-auto min-h-[48px] rounded-lg bg-red-700 dark:bg-red-900/60 hover:bg-red-800 dark:hover:bg-red-900/70 text-white shadow-[0_0_40px_rgba(185,28,28,0.6)] dark:shadow-[0_0_40px_rgba(127,29,29,0.6)] hover:shadow-[0_0_60px_rgba(185,28,28,0.8)] dark:hover:shadow-[0_0_60px_rgba(127,29,29,0.8)] group relative overflow-hidden backdrop-blur-md border-2 border-red-600 dark:border-red-800/40 hover:border-red-500 dark:hover:border-red-700/60 transition-all duration-300 hover:scale-105 animate-pulse"
            onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
            aria-label="Take the Polish Citizenship Test to check your eligibility"
          >
            <span className="relative z-10 font-bold drop-shadow-lg">
              Take Polish Citizenship Test
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-800/30 to-red-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </div>
      </div>
    </section>
  );
}
