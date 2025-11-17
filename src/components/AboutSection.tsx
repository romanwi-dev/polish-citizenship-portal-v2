import { Shield, Users, Globe } from "lucide-react";
import { MainCTA } from "./ui/main-cta";
import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { SectionLayout } from "./layout/SectionLayout";
import { useDeviceTier } from "@/hooks/useDeviceTier";

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
  const deviceTier = useDeviceTier();
  const [isFlipped, setIsFlipped] = useState(false);
  const use3DFlip = deviceTier !== 'mobile';

  return (
    <div 
      className="h-[420px] md:h-[580px] cursor-pointer animate-fade-in"
      style={{ 
        animationDelay: `${(index + 1) * 100}ms`,
        perspective: use3DFlip ? '1000px' : 'none'
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: use3DFlip ? 'preserve-3d' : 'flat',
          transform: use3DFlip && isFlipped ? 'rotateY(180deg)' : 'none'
        }}
      >
        <div 
          className="absolute inset-0 glass-card p-8 rounded-lg hover-glow flex flex-col transition-opacity duration-300"
          style={{ 
            backfaceVisibility: use3DFlip ? 'hidden' : 'visible',
            opacity: !use3DFlip && isFlipped ? 0 : 1
          }}
        >
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 mb-4 rounded-xl bg-gradient-to-br from-primary/40 to-primary/60 flex items-center justify-center shadow-md">
              <Icon className="w-7 h-7 text-white/90" />
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
          className="absolute inset-0 glass-card p-8 rounded-lg flex items-center justify-center transition-opacity duration-300"
          style={{ 
            backfaceVisibility: use3DFlip ? 'hidden' : 'visible',
            transform: use3DFlip ? 'rotateY(180deg)' : 'none',
            opacity: !use3DFlip && !isFlipped ? 0 : 1,
            pointerEvents: !use3DFlip && !isFlipped ? 'none' : 'auto'
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
