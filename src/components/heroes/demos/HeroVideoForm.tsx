import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Award from 'lucide-react/dist/esm/icons/award';
import Users from 'lucide-react/dist/esm/icons/users';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import { useState } from 'react';

export const HeroVideoForm = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank');
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.4)' }}
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-set-of-plateaus-seen-from-the-heights-in-a-sunset-26070-large.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background z-[1]" />

      {/* Content */}
      <div className="container relative z-10 px-4 py-20 mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30 backdrop-blur-xl">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-white">
              {t('hero.badge')}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-heading font-black leading-tight tracking-tight text-white drop-shadow-2xl">
            {t('hero.title')}
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl font-semibold leading-relaxed text-white/90 drop-shadow-lg">
            {t('hero.description')}
          </p>

          {/* Lead Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder:text-white/60 focus:border-primary outline-none"
                required
              />
              <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:scale-105 transition-transform">
                Start
              </button>
            </div>
          </form>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-8">
            <div className="backdrop-blur-xl bg-white/10 p-8 rounded-lg border border-white/20 hover:scale-105 transition-transform">
              <Award className="w-6 h-6 text-white mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-white mb-2">&gt;20</h3>
              <p className="text-base font-semibold text-white/90">
                {t('hero.stats.experience')}
              </p>
            </div>
            
            <div className="backdrop-blur-xl bg-white/10 p-8 rounded-lg border border-white/20 hover:scale-105 transition-transform">
              <Users className="w-6 h-6 text-white mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-white mb-2">&gt;25,000</h3>
              <p className="text-base font-semibold text-white/90">
                {t('hero.stats.cases')}
              </p>
            </div>
            
            <div className="backdrop-blur-xl bg-white/10 p-8 rounded-lg border border-white/20 hover:scale-105 transition-transform">
              <Trophy className="w-6 h-6 text-white mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-white mb-2">100%</h3>
              <p className="text-base font-semibold text-white/90">
                {t('hero.stats.success')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};