import { Brain, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { MainCTA } from "./ui/main-cta";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { SectionLayout } from "./layout/SectionLayout";

const FlippableAICard = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient, 
  index 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  gradient: string; 
  index: number;
}) => {
  const { t } = useTranslation('landing');
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="h-[280px] cursor-pointer animate-fade-in"
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
          className="absolute inset-0 glass-card p-8 rounded-lg hover-glow flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 mb-5 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 dark:from-primary/40 dark:to-secondary/40 flex items-center justify-center shadow-lg backdrop-blur-sm border border-primary/20">
              <Icon className="w-9 h-9 text-primary dark:text-white/90" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg sm:text-xl font-bold mb-3 font-heading leading-tight break-words hyphens-auto px-1">{title}</h3>
            <p className="text-base text-muted-foreground leading-relaxed font-body font-light text-center">
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
              {t('aiAnalysis.flipBack')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AIAnalysisSection = () => {
  const { t } = useTranslation();
  
  return (
    <SectionLayout
      id="ai-analysis"
      badge={{ icon: Brain, text: t('aiAnalysis.badge') }}
      title={t('aiAnalysis.title')}
      subtitle={
        <>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 font-body font-light tracking-normal">
            {t('aiAnalysis.description1')}
          </p>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-body font-light tracking-normal">
            {t('aiAnalysis.description2')}
          </p>
        </>
      }
      cta={<MainCTA ariaLabel="Start your AI-powered eligibility analysis">{t('hero.cta')}</MainCTA>}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        <FlippableAICard
          icon={TrendingUp}
          title={t('aiAnalysis.card1Title')}
          description={t('aiAnalysis.card1Desc')}
          gradient="from-primary to-secondary"
          index={0}
        />
        
        <FlippableAICard
          icon={AlertTriangle}
          title={t('aiAnalysis.card2Title')}
          description={t('aiAnalysis.card2Desc')}
          gradient="from-secondary to-accent"
          index={1}
        />
        
        <FlippableAICard
          icon={Clock}
          title={t('aiAnalysis.card3Title')}
          description={t('aiAnalysis.card3Desc')}
          gradient="from-accent to-primary"
          index={2}
        />
      </div>
    </SectionLayout>
  );
};

export default AIAnalysisSection;