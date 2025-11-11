import { Shield, Users, Globe } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

const FlippableAboutCard = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient, 
  textColor, 
  index 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  gradient: string; 
  textColor: string; 
  index: number;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="h-[420px] md:h-[580px] cursor-pointer animate-fade-in"
      style={{ 
        animationDelay: `${(index + 1) * 100}ms`,
        perspective: '1000px'
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front */}
        <div 
          className="absolute inset-0 glass-card p-8 rounded-lg hover-glow flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-center flex flex-col items-center justify-center">
            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <Icon className={`w-8 h-8 ${textColor}`} />
            </div>
            <h3 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-4 font-heading">{title}</h3>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-body font-light text-center">
              {description}
            </p>
          </div>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 glass-card p-8 rounded-lg flex items-center justify-center"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 rounded-lg`} />
          <div className="relative z-10 text-center">
            <p className="text-muted-foreground italic">
              Click to flip back
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AboutSection = () => {
  return (
    <section className="relative py-24 overflow-hidden overflow-x-hidden">
      
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-16">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Legal Expertise Since 2003</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-heading font-black mb-14 tracking-tight animate-scale-in">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Your Gateway to Polish & EU Citizenship
            </span>
          </h2>
          
          <div className="mb-16 max-w-6xl mx-auto px-2 md:px-0">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 font-body font-light tracking-normal">
              Since 2003, we've helped thousands of people with Polish ancestry reclaim their heritage and obtain Polish citizenship by descent. Our expert team combines legal expertise, document research, and government consultation to guide you through every step of your journey to becoming an EU citizen.
            </p>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-body font-light tracking-normal">
              Transform your Polish heritage into reality. Get expert guidance, transparent pricing, and proven results on your path to Polish citizenship and an EU passport.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <FlippableAboutCard 
            icon={Users}
            title="20M+ Poles Worldwide"
            description="Over 20 million people of Polish descent live outside Poland—that's more than half of Poland's population. Your Polish heritage could be your gateway to EU citizenship."
            gradient="from-primary/20 to-secondary/20"
            textColor="text-primary"
            index={0}
          />

          <FlippableAboutCard 
            icon={Globe}
            title="Full EU Access"
            description="Poland joined the EU in 2004. Polish citizenship means you can live, work, and study freely in all 27 EU countries—from Paris to Berlin to Rome."
            gradient="from-secondary/20 to-accent/20"
            textColor="text-secondary"
            index={1}
          />

          <FlippableAboutCard 
            icon={Shield}
            title="Lifetime Benefits"
            description="Access world-class European education, healthcare, and career opportunities. Your Polish passport opens doors across the entire European Union for you and your family."
            gradient="from-accent/20 to-primary/20"
            textColor="text-accent"
            index={2}
          />
        </div>
        
        {/* CTA Button - Properly positioned below cards grid */}
        <div className="flex justify-center mt-40 mb-20 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <Button 
            size="lg" 
            className="text-xl md:text-2xl font-bold px-12 py-6 md:px-20 md:py-6 h-auto min-h-[64px] md:min-h-[72px] rounded-lg bg-red-700 dark:bg-red-900/60 hover:bg-red-800 dark:hover:bg-red-900/70 text-white shadow-[0_0_40px_rgba(185,28,28,0.6)] dark:shadow-[0_0_40px_rgba(127,29,29,0.6)] hover:shadow-[0_0_60px_rgba(185,28,28,0.8)] dark:hover:shadow-[0_0_60px_rgba(127,29,29,0.8)] group relative overflow-hidden backdrop-blur-md border-2 border-red-600 dark:border-red-800/40 hover:border-red-500 dark:hover:border-red-700/60 transition-all duration-300 hover:scale-105 animate-pulse" 
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
};

export default AboutSection;
