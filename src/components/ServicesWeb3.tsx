import { FileText, Users, CheckCircle, Globe, Cpu, Shield, Zap } from "lucide-react";
import { useState, memo, useCallback } from "react";
import { MainCTA } from "./ui/main-cta";
import { useTranslation } from 'react-i18next';
import { SectionLayout } from "./layout/SectionLayout";
import { getStaggerDelay } from "@/config/animations";
import { useDeviceTier } from "@/hooks/useDeviceTier";

const FlippableServiceCard = memo(({
  icon: Icon,
  title,
  description,
  color,
  index
}: { 
  icon: any;
  title: string;
  description: string;
  color: string;
  index: number;
}) => {
  const { t } = useTranslation();
  const deviceTier = useDeviceTier();
  const [isFlipped, setIsFlipped] = useState(false);
  const use3DFlip = deviceTier !== 'mobile';
  
  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  return (
    <div 
      className="h-[280px] cursor-pointer animate-fade-in"
      style={{ 
        animationDelay: `${getStaggerDelay(index)}ms`,
        perspective: use3DFlip ? '1000px' : 'none'
      }}
      onClick={handleFlip}
    >
      <div 
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: use3DFlip ? 'preserve-3d' : 'flat',
          transform: use3DFlip && isFlipped ? 'rotateY(180deg)' : 'none'
        }}
      >
        <div 
          className="absolute inset-0 glass-card p-8 rounded-lg hover-glow group overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-1"
          style={{ 
            backfaceVisibility: use3DFlip ? 'hidden' : 'visible',
            opacity: !use3DFlip && isFlipped ? 0 : 1
          }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/40 to-primary/60 flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <Icon className="h-7 w-7 text-white/90" />
              </div>
              <h3 className="text-xl font-bold">
                {title}
              </h3>
            </div>
            <p className="text-muted-foreground leading-relaxed font-medium">
              {description}
            </p>
          </div>

          <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${color} opacity-20 blur-2xl rounded-full`} />
        </div>

        <div 
          className="absolute inset-0 glass-card p-8 rounded-lg overflow-hidden flex items-center justify-center transition-opacity duration-300"
          style={{ 
            backfaceVisibility: use3DFlip ? 'hidden' : 'visible',
            transform: use3DFlip ? 'rotateY(180deg)' : 'none',
            opacity: !use3DFlip && !isFlipped ? 0 : 1,
            pointerEvents: !use3DFlip && !isFlipped ? 'none' : 'auto'
          }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-20`} />
          
          <div className="relative z-10 text-center">
            <p className="text-muted-foreground italic">
              {t('services.flipBack')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});

FlippableServiceCard.displayName = 'FlippableServiceCard';

const ServicesWeb3 = () => {
  const { t } = useTranslation();
  
  return (
    <SectionLayout
      id="services"
      badge={{ icon: Zap, text: t('services.badge') }}
      title={t('services.title')}
      subtitle={t('services.description')}
      cta={
        <MainCTA
          animationDelay="400ms"
          onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
          ariaLabel="Take the Polish Citizenship Test to check your eligibility"
        >
          {t('hero.cta')}
        </MainCTA>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        <FlippableServiceCard
          icon={Cpu}
          title={t('services.service1Title')}
          description={t('services.service1Desc')}
          color="from-primary to-accent"
          index={0}
        />
        <FlippableServiceCard
          icon={Shield}
          title={t('services.service2Title')}
          description={t('services.service2Desc')}
          color="from-secondary to-primary"
          index={1}
        />
        <FlippableServiceCard
          icon={Users}
          title={t('services.service3Title')}
          description={t('services.service3Desc')}
          color="from-accent to-secondary"
          index={2}
        />
        <FlippableServiceCard
          icon={FileText}
          title={t('services.service4Title')}
          description={t('services.service4Desc')}
          color="from-primary to-secondary"
          index={3}
        />
        <FlippableServiceCard
          icon={CheckCircle}
          title={t('services.service5Title')}
          description={t('services.service5Desc')}
          color="from-secondary to-accent"
          index={4}
        />
        <FlippableServiceCard
          icon={Globe}
          title={t('services.service6Title')}
          description={t('services.service6Desc')}
          color="from-accent to-primary"
          index={5}
        />
      </div>
    </SectionLayout>
  );
};

export default ServicesWeb3;
