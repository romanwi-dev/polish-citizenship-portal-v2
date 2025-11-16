import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Award from 'lucide-react/dist/esm/icons/award';
import Users from 'lucide-react/dist/esm/icons/users';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import { useState } from 'react';

export const HeroGradientForm = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank');
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-secondary to-primary opacity-20 animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary))_0%,transparent_50%)] opacity-30 animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,hsl(var(--secondary))_0%,transparent_50%)] opacity-30 animate-[pulse_10s_ease-in-out_infinite]" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
      </div>

      {/* Mesh Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background z-[1]" />

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

          {/* Lead Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-background/50 border border-border focus:border-primary outline-none"
                required
              />
              <button type="submit" className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:scale-105 transition-transform">
                Start
              </button>
            </div>
          </form>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto pt-8">
            <div className="glass-card hover-glow p-8 rounded-lg backdrop-blur-md border border-primary/20 hover:scale-105 transition-transform">
              <Award className="w-6 h-6 text-primary mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-primary mb-2">&gt;20</h3>
              <p className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('hero.stats.experience')}
              </p>
            </div>
            
            <div className="glass-card hover-glow p-8 rounded-lg backdrop-blur-md border border-secondary/20 hover:scale-105 transition-transform">
              <Users className="w-6 h-6 text-secondary mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-secondary mb-2">&gt;25,000</h3>
              <p className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('hero.stats.cases')}
              </p>
            </div>
            
            <div className="glass-card hover-glow p-8 rounded-lg backdrop-blur-md border border-primary/20 hover:scale-105 transition-transform">
              <Trophy className="w-6 h-6 text-primary mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-primary mb-2">100%</h3>
              <p className="text-base font-semibold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t('hero.stats.success')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};