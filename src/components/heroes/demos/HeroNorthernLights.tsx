import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Award from 'lucide-react/dist/esm/icons/award';
import Users from 'lucide-react/dist/esm/icons/users';
import Trophy from 'lucide-react/dist/esm/icons/trophy';

export const HeroNorthernLights = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 via-blue-950 to-gray-900">
      {/* Aurora Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-blue-500/20 to-purple-500/20 animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute inset-0 bg-gradient-to-tl from-teal-500/20 via-cyan-500/20 to-blue-500/20 animate-pulse" style={{ animationDuration: '12s', animationDelay: '2s' }} />
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent animate-[shimmer_15s_ease-in-out_infinite]" />
        <div className="absolute top-0 left-0 right-0 h-3/4 bg-gradient-to-b from-cyan-500/10 via-transparent to-transparent animate-[shimmer_18s_ease-in-out_infinite]" style={{ animationDelay: '3s' }} />
      </div>

      {/* Stars */}
      <div className="absolute inset-0 z-[1]">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              opacity: 0.3 + Math.random() * 0.7
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="container relative z-10 px-4 py-20 mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/5 border border-emerald-500/30">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-100">
              {t('hero.badge')}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-heading font-black leading-tight tracking-tight text-white drop-shadow-[0_0_30px_rgba(16,185,129,0.5)]">
            {t('hero.title')}
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl font-semibold leading-relaxed text-emerald-50/90">
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
            <div className="backdrop-blur-xl bg-emerald-500/10 p-8 rounded-lg border border-emerald-500/20 hover:scale-105 transition-transform hover:bg-emerald-500/20">
              <Award className="w-6 h-6 text-emerald-400 mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-emerald-300 mb-2">&gt;20</h3>
              <p className="text-base font-semibold text-emerald-100/90">
                {t('hero.stats.experience')}
              </p>
            </div>
            
            <div className="backdrop-blur-xl bg-cyan-500/10 p-8 rounded-lg border border-cyan-500/20 hover:scale-105 transition-transform hover:bg-cyan-500/20">
              <Users className="w-6 h-6 text-cyan-400 mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-cyan-300 mb-2">&gt;25,000</h3>
              <p className="text-base font-semibold text-cyan-100/90">
                {t('hero.stats.cases')}
              </p>
            </div>
            
            <div className="backdrop-blur-xl bg-teal-500/10 p-8 rounded-lg border border-teal-500/20 hover:scale-105 transition-transform hover:bg-teal-500/20">
              <Trophy className="w-6 h-6 text-teal-400 mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-teal-300 mb-2">100%</h3>
              <p className="text-base font-semibold text-teal-100/90">
                {t('hero.stats.success')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0%, 100% { transform: translateX(-100%) skewX(-15deg); opacity: 0; }
          50% { transform: translateX(100%) skewX(-15deg); opacity: 0.3; }
        }
      `}</style>
    </section>
  );
};