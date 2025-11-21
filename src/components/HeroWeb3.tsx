import { MainCTA } from "@/components/ui/main-cta";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import Award from "lucide-react/dist/esm/icons/award";
import Users from "lucide-react/dist/esm/icons/users";
import Trophy from "lucide-react/dist/esm/icons/trophy";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const HeroWeb3 = () => {
  const { t, i18n } = useTranslation();
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const isRTL = i18n.language === 'he';

  // Debug logging
  console.log('🌍 Current language:', i18n.language);
  console.log('📝 subtitle1 translation:', t('hero.subtitle1'));
  console.log('📝 subtitle2 translation:', t('hero.subtitle2'));
  console.log('📦 i18n store:', i18n.store.data);

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  return <section className="relative min-h-[60vh] md:min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background/95 to-background">
      {/* Solid background - no images */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />


      {/* Content */}
      <div className="container relative z-10 px-4 pt-32 pb-20 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-16 animate-fade-in w-fit max-w-[280px] mx-auto md:max-w-none border border-primary/30">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{t('hero.badge')}</span>
          </div>
          
          <h1 className="text-6xl md:text-6xl lg:text-8xl font-heading font-black mb-14 leading-tight animate-fade-in tracking-tight" style={{
          contentVisibility: 'auto'
        }}>
            <span className={`bg-clip-text text-transparent ${
              isRTL ? 'bg-gradient-to-l from-primary via-secondary to-primary-foreground' : 'bg-gradient-to-r from-primary via-secondary to-primary-foreground'
            }`}>
              {t('hero.title')}
            </span>
          </h1>
          
          <div className="space-y-6 mb-12 md:mb-16 animate-fade-in" key={i18n.language}>
            <p className="text-lg md:text-xl font-medium leading-relaxed max-w-full md:max-w-[95%] mx-auto px-4 md:px-0 text-foreground/90">
              {t('hero.subtitle1')}
            </p>
            <p className="text-base md:text-lg font-normal leading-relaxed max-w-full md:max-w-[90%] mx-auto px-4 md:px-0 text-foreground/80">
              {t('hero.subtitle2')}
            </p>
          </div>
          
          <MainCTA
            wrapperClassName="flex justify-center animate-fade-in"
            onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
            ariaLabel="Take the Polish Citizenship Test to check your eligibility"
          >
            {t('hero.cta')}
          </MainCTA>
        </div>
      </div>


      {/* Stats Badges */}
      <div className="container relative z-10 px-4 mx-auto pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in max-w-6xl mx-auto" style={{ animationDelay: '200ms' }}>
            {/* Card 1 - Dark Blue with glow */}
            <div 
              className="glass-card hover-glow p-4 md:p-8 rounded-lg text-center relative min-h-[120px] md:min-h-[160px] flex items-center justify-center w-full max-w-[240px] mx-auto md:max-w-none backdrop-blur-md border dark:border-primary/20 light:border-primary/30 dark:bg-card/60 light:bg-gradient-to-br light:from-[hsl(220_90%_25%)] light:to-[hsl(220_90%_18%)] transition-all duration-300 hover:scale-105 hover:shadow-2xl light:hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]"
            >
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <Award className="w-5 h-5 md:w-6 md:h-6 dark:text-primary light:text-white/90 light:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" strokeWidth={1.5} />
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold dark:text-primary light:text-white light:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]">&gt;20</h3>
                <p className="text-sm md:text-base font-semibold dark:bg-gradient-to-r dark:from-primary dark:to-secondary dark:bg-clip-text dark:text-transparent light:text-gray-200 light:drop-shadow-[0_0_4px_rgba(255,255,255,0.5)] leading-tight">{t('hero.stats.experience')}</p>
              </div>
            </div>

            {/* Card 2 - Dark Red with glow */}
            <div 
              className="glass-card hover-glow p-4 md:p-8 rounded-lg text-center relative min-h-[120px] md:min-h-[160px] flex items-center justify-center w-full max-w-[240px] mx-auto md:max-w-none backdrop-blur-md border dark:border-secondary/20 light:border-red-500/30 dark:bg-card/60 light:bg-gradient-to-br light:from-[hsl(0_80%_30%)] light:to-[hsl(0_80%_22%)] transition-all duration-300 hover:scale-105 hover:shadow-2xl light:hover:shadow-[0_0_40px_rgba(239,68,68,0.4)]"
            >
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <Users className="w-5 h-5 md:w-6 md:h-6 dark:text-secondary light:text-white/90 light:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" strokeWidth={1.5} />
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold dark:text-secondary light:text-white light:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]">&gt;25,000</h3>
                <p className="text-sm md:text-base font-semibold dark:bg-gradient-to-r dark:from-primary dark:to-secondary dark:bg-clip-text dark:text-transparent light:text-gray-200 light:drop-shadow-[0_0_4px_rgba(255,255,255,0.5)] leading-tight">{t('hero.stats.cases')}</p>
              </div>
            </div>

            {/* Card 3 - Dark Blue with glow */}
            <div 
              className="glass-card hover-glow p-4 md:p-8 rounded-lg text-center relative min-h-[120px] md:min-h-[160px] flex items-center justify-center w-full max-w-[240px] mx-auto md:max-w-none backdrop-blur-md border dark:border-primary/20 light:border-primary/30 dark:bg-card/60 light:bg-gradient-to-br light:from-[hsl(220_90%_25%)] light:to-[hsl(220_90%_18%)] transition-all duration-300 hover:scale-105 hover:shadow-2xl light:hover:shadow-[0_0_40px_rgba(59,130,246,0.4)]"
            >
              <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                <Trophy className="w-5 h-5 md:w-6 md:h-6 dark:text-primary light:text-white/90 light:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" strokeWidth={1.5} />
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold dark:text-primary light:text-white light:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]">100%</h3>
                <p className="text-sm md:text-base font-semibold dark:bg-gradient-to-r dark:from-primary dark:to-secondary dark:bg-clip-text dark:text-transparent light:text-gray-200 light:drop-shadow-[0_0_4px_rgba(255,255,255,0.5)] leading-tight">{t('hero.stats.success')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};

export default HeroWeb3;