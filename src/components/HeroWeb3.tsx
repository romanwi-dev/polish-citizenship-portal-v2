import { MainCTA } from "@/components/ui/main-cta";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import { useState } from "react";
import warsawAnimation from "@/assets/hero/warsaw-animation.png";
import { useTranslation } from "react-i18next";

const HeroWeb3 = () => {
  const { t, i18n } = useTranslation();
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const isRTL = i18n.language === 'he';

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  return <section className="relative min-h-[60vh] md:min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={warsawAnimation} 
          alt="Warsaw Futuristic Cityscape" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 hero-overlay dark:bg-gradient-to-b dark:from-background/85 dark:via-background/75 dark:to-background/95 light:bg-gradient-to-b light:from-background/60 light:via-background/50 light:to-background/70 md:light:from-background/40 md:light:via-background/30 md:light:to-background/50" />
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 pt-32 pb-20 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-16 animate-fade-in w-fit max-w-[280px] mx-auto md:max-w-none border border-primary/30">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{t('hero.badge')}</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-heading font-black mb-14 leading-tight animate-fade-in tracking-tight" style={{
          contentVisibility: 'auto'
        }}>
            <span className={`bg-clip-text text-transparent ${
              isRTL ? 'bg-gradient-to-l from-primary via-secondary to-primary-foreground' : 'bg-gradient-to-r from-primary via-secondary to-primary-foreground'
            }`}>
              {t('hero.title')}
            </span>
          </h1>
          
          <p className="text-base md:text-lg lg:text-xl font-medium mb-12 md:mb-16 leading-relaxed max-w-full md:max-w-[95%] animate-fade-in mx-auto px-4 md:px-0 text-foreground">
            {t('hero.description')}
          </p>
          
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
            {/* Card 1 */}
            <div 
              className="glass-card hover-glow p-6 md:p-8 rounded-lg text-center relative min-h-[140px] md:min-h-[160px] flex items-center justify-center w-full max-w-[280px] mx-auto md:max-w-none backdrop-blur-md border border-primary/20 theme-red.light:bg-[hsl(343_79%_53%/0.08)] theme-blue.light:bg-[hsl(221_83%_53%/0.08)]"
            >
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-shadow-primary">&gt;20</h3>
                <p className="text-sm md:text-base font-semibold text-foreground leading-tight">{t('hero.stats.experience')}</p>
              </div>
            </div>

            {/* Card 2 */}
            <div 
              className="glass-card hover-glow p-6 md:p-8 rounded-lg text-center relative min-h-[140px] md:min-h-[160px] flex items-center justify-center w-full max-w-[280px] mx-auto md:max-w-none backdrop-blur-md border border-primary/20 theme-red.light:bg-[hsl(343_79%_53%/0.08)] theme-blue.light:bg-[hsl(221_83%_53%/0.08)]"
            >
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-shadow-primary">&gt;25,000</h3>
                <p className="text-sm md:text-base font-semibold text-foreground leading-tight">{t('hero.stats.cases')}</p>
              </div>
            </div>

            {/* Card 3 */}
            <div 
              className="glass-card hover-glow p-6 md:p-8 rounded-lg text-center relative min-h-[140px] md:min-h-[160px] flex items-center justify-center w-full max-w-[280px] mx-auto md:max-w-none backdrop-blur-md border border-primary/20 theme-red.light:bg-[hsl(343_79%_53%/0.08)] theme-blue.light:bg-[hsl(221_83%_53%/0.08)]"
            >
              <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent text-shadow-primary">100%</h3>
                <p className="text-sm md:text-base font-semibold text-foreground leading-tight">{t('hero.stats.success')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};

export default HeroWeb3;