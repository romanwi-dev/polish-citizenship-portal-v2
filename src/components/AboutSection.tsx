import { Shield, Users, Globe } from "lucide-react";
import { Button } from "./ui/button";
import { MainCTA } from "./ui/main-cta";
import { useState } from "react";
import { useTranslation } from 'react-i18next';

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
            <h3 className="text-2xl md:text-3xl font-bold text-primary mb-4 font-heading">{title}</h3>
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
  const { t } = useTranslation();
  
  return (
    <section className="relative py-24 overflow-hidden overflow-x-hidden">
      
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-16 border border-primary/30">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{t('about.badge')}</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-heading font-black mb-14 tracking-tight animate-scale-in">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t('about.title')}
            </span>
          </h2>
          
          <div className="mb-16 max-w-6xl mx-auto px-2 md:px-0">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 font-body font-light tracking-normal">
              {t('about.description')}
            </p>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-body font-light tracking-normal">
              Transform your Polish heritage into reality. Get expert guidance, transparent pricing, and proven results on your path to Polish citizenship and an EU passport.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
          <FlippableAboutCard 
            icon={Shield}
            title={t('about.card1Title')}
            description={t('about.card1Text')}
            gradient="from-primary/20 to-secondary/20"
            textColor="text-primary"
            index={0}
          />

          <FlippableAboutCard 
            icon={Users}
            title={t('about.card2Title')}
            description={t('about.card2Text')}
            gradient="from-secondary/20 to-accent/20"
            textColor="text-secondary"
            index={1}
          />

          <FlippableAboutCard 
            icon={Globe}
            title={t('about.card3Title')}
            description={t('about.card3Text')}
            gradient="from-accent/20 to-primary/20"
            textColor="text-accent"
            index={2}
          />
        </div>
        
        <MainCTA
          wrapperClassName="mt-40 mb-20"
          animationDelay="400ms"
          onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
          ariaLabel="Take the Polish Citizenship Test to check your eligibility"
        >
          {t('about.cta')}
        </MainCTA>
      </div>
    </section>
  );
};

export default AboutSection;
