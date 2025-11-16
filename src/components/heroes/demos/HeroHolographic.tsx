import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Award from 'lucide-react/dist/esm/icons/award';
import Users from 'lucide-react/dist/esm/icons/users';
import Trophy from 'lucide-react/dist/esm/icons/trophy';

export const HeroHolographic = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-black">
      {/* Holographic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-pink-900/30 to-blue-900/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/20 via-transparent to-transparent animate-pulse" />
        <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,0,255,0.1)_180deg,transparent_360deg)] animate-spin" style={{ animationDuration: '20s' }} />
      </div>

      {/* Iridescent Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_40%,transparent_100%)] z-[1]" />

      {/* Content */}
      <div className="container relative z-10 px-4 py-20 mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-purple-200">
              {t('hero.badge')}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-heading font-black leading-tight tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-[gradient_8s_ease_infinite]">
              {t('hero.title')}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl font-semibold leading-relaxed text-purple-100/90">
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
            <div className="backdrop-blur-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-8 rounded-lg border border-purple-500/30 hover:scale-105 transition-transform">
              <Award className="w-6 h-6 text-purple-400 mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-purple-300 mb-2">&gt;20</h3>
              <p className="text-base font-semibold text-purple-100/90">
                {t('hero.stats.experience')}
              </p>
            </div>
            
            <div className="backdrop-blur-xl bg-gradient-to-br from-pink-500/20 to-blue-500/20 p-8 rounded-lg border border-pink-500/30 hover:scale-105 transition-transform">
              <Users className="w-6 h-6 text-pink-400 mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-pink-300 mb-2">&gt;25,000</h3>
              <p className="text-base font-semibold text-pink-100/90">
                {t('hero.stats.cases')}
              </p>
            </div>
            
            <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-8 rounded-lg border border-blue-500/30 hover:scale-105 transition-transform">
              <Trophy className="w-6 h-6 text-blue-400 mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-blue-300 mb-2">100%</h3>
              <p className="text-base font-semibold text-blue-100/90">
                {t('hero.stats.success')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </section>
  );
};