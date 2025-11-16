import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Award from 'lucide-react/dist/esm/icons/award';
import Users from 'lucide-react/dist/esm/icons/users';
import Trophy from 'lucide-react/dist/esm/icons/trophy';

export const HeroWaveBackground = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Animated Wave Background */}
      <div className="absolute inset-0 z-0">
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 0.3 }} />
              <stop offset="100%" style={{ stopColor: 'hsl(var(--secondary))', stopOpacity: 0.3 }} />
            </linearGradient>
          </defs>
          <path
            fill="url(#gradient1)"
            d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,112C960,117,1056,139,1152,144C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            className="animate-[wave_20s_ease-in-out_infinite]"
          />
          <path
            fill="url(#gradient1)"
            d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,154.7C672,149,768,171,864,181.3C960,192,1056,192,1152,181.3C1248,171,1344,149,1392,138.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            className="animate-[wave_15s_ease-in-out_infinite] opacity-50"
            style={{ animationDelay: '-5s' }}
          />
        </svg>
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-20 mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {t('hero.badge')}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-heading font-black leading-tight tracking-tight">
            <span className={`bg-clip-text text-transparent ${
              isRTL ? 'bg-gradient-to-l from-primary via-secondary to-primary-foreground' : 'bg-gradient-to-r from-primary via-secondary to-primary-foreground'
            }`}>
              {t('hero.title')}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl font-semibold leading-relaxed text-foreground/90">
            {t('hero.description')}
          </p>

          <MainCTA
            onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
            ariaLabel="Take the Polish Citizenship Test"
          >
            {t('hero.cta')}
          </MainCTA>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-8">
            <div className="glass-card hover-glow p-8 rounded-lg backdrop-blur-md border border-primary/20">
              <Award className="w-6 h-6 text-primary mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-primary mb-2">&gt;20</h3>
              <p className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('hero.stats.experience')}
              </p>
            </div>
            
            <div className="glass-card hover-glow p-8 rounded-lg backdrop-blur-md border border-secondary/20">
              <Users className="w-6 h-6 text-secondary mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-secondary mb-2">&gt;25,000</h3>
              <p className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('hero.stats.cases')}
              </p>
            </div>
            
            <div className="glass-card hover-glow p-8 rounded-lg backdrop-blur-md border border-primary/20">
              <Trophy className="w-6 h-6 text-primary mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-primary mb-2">100%</h3>
              <p className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('hero.stats.success')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes wave {
          0%, 100% { d: path("M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,112C960,117,1056,139,1152,144C1248,149,1344,139,1392,133.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"); }
          50% { d: path("M0,128L48,144C96,160,192,192,288,197.3C384,203,480,181,576,165.3C672,149,768,139,864,144C960,149,1056,171,1152,176C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"); }
        }
      `}</style>
    </section>
  );
};