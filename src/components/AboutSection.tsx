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
      className="h-[380px] cursor-pointer animate-fade-in"
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
          className="absolute inset-0 glass-card p-8 rounded-lg hover-glow text-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <Icon className={`w-8 h-8 ${textColor}`} />
          </div>
          <h3 className="text-xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-3">{title}</h3>
          <p className="text-muted-foreground">
            {description}
          </p>
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
    <section className="relative py-32 overflow-hidden overflow-x-hidden">
      
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-16">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Legal Expertise Since 2003</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-heading font-black mb-14 tracking-tight animate-scale-in">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              The Most Comprehensive Online Legal Service for Polish Citizenship and Polish European Passport
            </span>
          </h2>
          
          <div className="mb-16">
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed mb-6 text-left px-4 md:px-0">
              Since 2003, we have been advising people of Polish ancestry in confirming Polish citizenship by descent, obtaining a European Polish passport, and navigating all related matters. For almost 20 years, we have been working to help people of Polish descent from various countries in receiving Polish citizenship and a Polish European passport. Our excellent legal assistance is provided by independent experts in the field of Polish citizenship, lawyers of various specializations, experienced representatives, and documents researchers, as well as the use of advice and consultations provided by the staff of the relevant Polish government offices.
            </p>
            
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed text-left px-4 md:px-0">
              Embark on your journey to obtaining Polish citizenship and enjoy the benefits of a European Polish passport. Trust us to provide you with the guidance, expertise, and support you need to navigate the complexities of the application process. Start your application today and make your Polish heritage a permanent part of your identity.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FlippableAboutCard 
            icon={Users}
            title="Over 20 Million People of Polish Descent"
            description="There are more than 20 million people of Polish descent that live outside of Poland today, which itself has a population of about 38.5 million. This means that more than 1/3 of Poles and people of Polish descent actually live outside of the country. For many generations of European unrest, people have been emigrating outside of Poland, especially in the 20th century."
            gradient="from-primary/20 to-secondary/20"
            textColor="text-primary"
            index={0}
          />

          <FlippableAboutCard 
            icon={Globe}
            title="Poland - EU Member Since 2004"
            description="Since 1989, however, the quality of life has changed for the better in Poland. Poland has been an EU member since 2004 and is one of its biggest countries. We support the idea of a united Europe, and being a European citizen is a widely held dream. Many people of Polish origin can now legally confirm their Polish citizenship by descent and obtain the Polish European passport as a gateway to the EU."
            gradient="from-secondary/20 to-accent/20"
            textColor="text-secondary"
            index={1}
          />

          <FlippableAboutCard 
            icon={Shield}
            title="The Benefits of Polish European Citizenship"
            description="The education system in Europe is outstanding and offers the best elementary schools, top high schools, and some of the world's best universities. The latest medical technology and the best pharmaceutical developments ensure that your health is in good hands in Europe. With a Polish European passport you can freely move, travel, live, and work in any of the 28 member states of the EU."
            gradient="from-accent/20 to-primary/20"
            textColor="text-accent"
            index={2}
          />
        </div>
        
        {/* CTA Button - Properly positioned below cards grid */}
        <div className="relative z-20 flex justify-center mt-20 animate-fade-in" style={{ animationDelay: '400ms' }}>
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
};

export default AboutSection;
