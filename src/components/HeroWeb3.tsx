import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useReducedMotion } from "@/hooks/useReducedMotion";

// Lazy load 3D components
const WavingEUFlag = lazy(() => import("./WavingEUFlag").then(module => ({ default: module.WavingEUFlag })));

const HeroWeb3 = () => {
  const [shouldLoadMap, setShouldLoadMap] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Load 3D when user doesn't prefer reduced motion
  const shouldShow3D = !prefersReducedMotion;

  // Use IntersectionObserver for lazy loading 3D component
  useEffect(() => {
    if (!shouldShow3D) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setShouldLoadMap(true);
        }
      },
      { threshold: 0.1 }
    );

    if (heroRef.current) {
      observer.observe(heroRef.current);
    }

    return () => observer.disconnect();
  }, [shouldShow3D]);
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  return <section ref={heroRef} className="relative min-h-[60vh] md:min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Background */}
      {shouldShow3D ? (
        <div className="absolute inset-0 z-0">
          <Suspense fallback={<div className="w-full h-full bg-gradient-to-b from-primary/5 to-background" />}>
            {shouldLoadMap && <WavingEUFlag />}
          </Suspense>
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/10 via-secondary/5 to-background" />
      )}


      {/* Content */}
      <div className="container relative z-10 px-4 pt-32 pb-20 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-16 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Web3 Legal Services</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-black mb-14 leading-tight animate-fade-in tracking-tight">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text">
              Polish Citizenship by Descent
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground font-light mb-12 md:mb-16 leading-relaxed max-w-full md:max-w-[95%] animate-fade-in mx-auto px-4 md:px-0">
            Expert legal guidance for people of Polish and Polish-Jewish descent from around the world for obtaining Polish citizenship and EU passports through Polish ancestry - unmatched success rate, true realistic timeline, transparent pricing
          </p>
          
          <div className="flex justify-center animate-fade-in mb-12 md:mb-20">
            <Button 
              size="lg" 
              className="text-lg md:text-2xl font-bold px-8 py-4 md:px-20 md:py-6 h-auto min-h-[48px] rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow group relative overflow-hidden backdrop-blur-md border border-white/30" 
              onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
              aria-label="Take the Polish Citizenship Test to check your eligibility"
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-bold">
                Polish Citizenship Test
              </span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 max-w-6xl mx-auto px-4">
            {[{
            value: "22+",
            label: "Years of Experience"
          }, {
            value: "25,000+",
            label: "Cases Processed"
          }, {
            value: "100%",
            label: "Unmatched Success Rate"
          }].map((stat, i) => <div key={i} className="glass-card p-4 md:p-6 rounded-lg hover-glow w-full">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground font-bold">{stat.label}</div>
              </div>)}
          </div>
        </div>
      </div>
    </section>;
};
export default HeroWeb3;