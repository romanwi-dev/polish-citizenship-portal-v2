import { FileText, Users, CheckCircle, Globe, Cpu, Shield, Zap } from "lucide-react";
import { useState, memo, useCallback } from "react";
import { MainCTA } from "./ui/main-cta";
import { useTranslation } from 'react-i18next';
import { SectionLayout } from "./layout/SectionLayout";
import { getStaggerDelay } from "@/config/animations";

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
  const { t } = useTranslation('landing');
  const [isFlipped, setIsFlipped] = useState(false);
  
  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  return (
    <div 
      className="h-[280px] cursor-pointer animate-fade-in"
      style={{ 
        animationDelay: `${getStaggerDelay(index)}ms`,
        perspective: '1000px'
      }}
      onClick={handleFlip}
    >
      <div 
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        <div 
          className="absolute inset-0 glass-card p-8 rounded-lg hover-glow group overflow-hidden transition-all duration-300 hover:scale-105 hover:-translate-y-1"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-primary/40 dark:to-secondary/40 flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm border border-primary/20">
                <Icon className="h-8 w-8 text-primary dark:text-white/90" strokeWidth={1.5} />
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
          className="absolute inset-0 glass-card p-8 rounded-lg overflow-hidden flex items-center justify-center"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
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
