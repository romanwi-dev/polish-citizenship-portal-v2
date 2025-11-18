import { Shield, Users, Globe } from "lucide-react";
import { MainCTA } from "./ui/main-cta";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { SectionLayout } from "./layout/SectionLayout";

const FlippableAboutCard = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient, 
  index,
  flipBackText
}: { 
  icon: any; 
  title: string; 
  description: string; 
  gradient: string; 
  index: number;
  flipBackText: string;
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
        <div 
          className="absolute inset-0 glass-card p-8 rounded-lg hover-glow flex flex-col"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-primary/40 dark:to-secondary/40 flex items-center justify-center shadow-lg backdrop-blur-sm border border-primary/20">
              <Icon className="w-10 h-10 text-primary dark:text-white/90" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 font-heading text-center leading-tight break-words hyphens-auto px-2">{title}</h3>
          </div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-body font-light text-center">
              {description}
            </p>
          </div>
        </div>

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
              {flipBackText}
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
    <SectionLayout
      id="about"
      badge={{ icon: Shield, text: t('about.badge') }}
      title={t('about.title')}
      subtitle={
        <>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 font-body font-light tracking-normal">
            {t('about.description')}
          </p>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-body font-light tracking-normal">
            {t('about.subtitle')}
          </p>
        </>
      }
      cta={<MainCTA ariaLabel="Start your Polish citizenship application">{t('hero.cta')}</MainCTA>}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <FlippableAboutCard
          icon={Users}
          title={t('about.card1Title')}
          description={t('about.card1Text')}
          gradient="from-primary to-secondary"
          index={0}
          flipBackText={t('about.flipBack')}
        />
        
        <FlippableAboutCard
          icon={Shield}
          title={t('about.card2Title')}
          description={t('about.card2Text')}
          gradient="from-secondary to-accent"
          index={1}
          flipBackText={t('about.flipBack')}
        />
        
        <FlippableAboutCard
          icon={Globe}
          title={t('about.card3Title')}
          description={t('about.card3Text')}
          gradient="from-accent to-primary"
          index={2}
          flipBackText={t('about.flipBack')}
        />
      </div>
    </SectionLayout>
  );
};

export default AboutSection;
