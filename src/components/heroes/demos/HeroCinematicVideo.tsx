import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import Sparkles from 'lucide-react/dist/esm/icons/sparkles';
import Award from 'lucide-react/dist/esm/icons/award';
import Users from 'lucide-react/dist/esm/icons/users';
import Trophy from 'lucide-react/dist/esm/icons/trophy';
import { useEffect, useRef } from 'react';

export const HeroCinematicVideo = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'he';
  const parallaxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.scrollY;
        parallaxRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Cinematic Video Background */}
      <div ref={parallaxRef} className="absolute inset-0 z-0 scale-110">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ filter: 'brightness(0.3) contrast(1.2)' }}
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-city-at-night-27-large.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Cinematic Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)] z-[1]" />
      
      {/* Film Grain Effect */}
      <div className="absolute inset-0 opacity-[0.03] z-[2] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

      {/* Content */}
      <div className="container relative z-10 px-4 py-20 mx-auto">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/5 border border-white/10">
            <Sparkles className="w-4 h-4 text-white/80" />
            <span className="text-sm font-medium text-white/90">
              {t('hero.badge')}
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-heading font-black leading-tight tracking-tight text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            {t('hero.title')}
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl font-semibold leading-relaxed text-white/90 drop-shadow-lg">
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
            <div className="backdrop-blur-xl bg-white/5 p-8 rounded-lg border border-white/10 hover:scale-105 transition-transform">
              <Award className="w-6 h-6 text-white/90 mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-white mb-2">&gt;20</h3>
              <p className="text-base font-semibold text-white/80">
                {t('hero.stats.experience')}
              </p>
            </div>
            
            <div className="backdrop-blur-xl bg-white/5 p-8 rounded-lg border border-white/10 hover:scale-105 transition-transform">
              <Users className="w-6 h-6 text-white/90 mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-white mb-2">&gt;25,000</h3>
              <p className="text-base font-semibold text-white/80">
                {t('hero.stats.cases')}
              </p>
            </div>
            
            <div className="backdrop-blur-xl bg-white/5 p-8 rounded-lg border border-white/10 hover:scale-105 transition-transform">
              <Trophy className="w-6 h-6 text-white/90 mx-auto mb-3" strokeWidth={1.5} />
              <h3 className="text-5xl font-bold text-white mb-2">100%</h3>
              <p className="text-base font-semibold text-white/80">
                {t('hero.stats.success')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};