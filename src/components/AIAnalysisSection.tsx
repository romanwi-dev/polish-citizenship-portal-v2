import { Brain, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { MainCTA } from "./ui/main-cta";
import { useState } from "react";
import { useTranslation } from "react-i18next";


const FlippableAICard = ({ 
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
  const { t } = useTranslation();
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
        {/* Front */}
        <div 
          className="absolute inset-0 glass-card p-8 rounded-lg hover-glow flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Icon className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 font-heading">{title}</h3>
            <p className="text-base text-muted-foreground leading-relaxed font-body font-light text-center">
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
    <section className="relative py-24 overflow-hidden overflow-x-hidden">
      
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-16 border border-primary/30">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{t('aiAnalysis.badge')}</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-14">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                {t('aiAnalysis.title')}
              </span>
            </h2>
            
            <div className="mb-16 max-w-6xl mx-auto px-2 md:px-0">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 font-body font-light tracking-normal">
                {t('aiAnalysis.description1')}
              </p>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-body font-light tracking-normal">
                {t('aiAnalysis.description2')}
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <FlippableAICard 
              icon={TrendingUp}
              title={t('aiAnalysis.card1Title')}
              description={t('aiAnalysis.card1Desc')}
              gradient="from-primary/20 to-secondary/20"
              textColor="text-primary"
              index={0}
            />

            <FlippableAICard 
              icon={Clock}
              title={t('aiAnalysis.card2Title')}
              description={t('aiAnalysis.card2Desc')}
              gradient="from-secondary/20 to-accent/20"
              textColor="text-secondary"
              index={1}
            />

            <FlippableAICard 
              icon={AlertTriangle}
              title={t('aiAnalysis.card3Title')}
              description={t('aiAnalysis.card3Desc')}
              gradient="from-accent/20 to-primary/20"
              textColor="text-accent"
              index={2}
            />
          </div>
          
          <MainCTA
            wrapperClassName="flex justify-center mt-40 mb-20 animate-fade-in"
            animationDelay="300ms"
            onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
            ariaLabel="Take the Polish Citizenship Test to check your eligibility"
          >
            {t('hero.cta')}
          </MainCTA>

        </div>
      </div>
    </section>
  );
};

export default AIAnalysisSection;