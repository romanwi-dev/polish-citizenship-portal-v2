import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import { Button } from '@/components/ui/button';
import { Award, Users, Trophy, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import professionalWoman from '@/assets/professional-woman.jpeg';
import { SocialShare } from '@/components/social/SocialShare';
import HeritageGlobe from '@/components/HeritageGlobe';
export const HeroWavingFlags = () => {
  const { t, i18n } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: ''
  });
  const isRTL = i18n.language === 'he';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email.trim() && formData.name.trim()) {
      setIsFlipped(true);
      setFormData({ name: '', email: '', country: '' });
    }
  };

  const features = [
    { icon: Award, stat: '>20', text: t('hero.stats.experience') },
    { icon: Users, stat: '>20,000', text: t('hero.stats.cases') },
    { icon: Trophy, stat: '100%', text: t('hero.stats.success') }
  ];

  return (
    // CLS FIX: min-h-screen ensures stable height, no layout shift
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-background pt-28 pb-16 md:pt-40 md:pb-20 lg:pt-48 lg:pb-24">
      {/* Heritage Globe as Background */}
      <HeritageGlobe asBackground={true} />
      
      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background/80 z-[1]" />

      <div className="container relative z-10 px-4 mx-auto">
        {/* Desktop: Two column layout, Mobile: Stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-8 lg:gap-8 xl:gap-10 items-start max-w-7xl mx-auto">
          {/* Left Column: Badge + Title + Text + Stats Cards */}
          <div className={`space-y-6 md:space-y-8 flex flex-col justify-start w-full order-1 lg:pt-20 ${isRTL ? 'lg:text-right lg:order-2' : 'lg:text-left'}`}>
            {/* Badge + Title Section */}
            <div className="space-y-5 md:space-y-6 text-center lg:text-left lg:[.lg\:text-right_&]:text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {t('hero.badge')}
                </span>
              </div>
              <h1 className="text-[2.5rem] sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-heading font-black leading-tight">
                <span className="inline-block" style={{ 
                  backgroundImage: 'var(--gradient-title)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent'
                }} dangerouslySetInnerHTML={{ __html: t('hero.title') }}>
                </span>
              </h1>
              <div className="space-y-3" key={t('hero.subtitle1')}>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-body font-light tracking-normal max-w-3xl mx-auto lg:mx-0 break-words hyphens-auto">
                  {t('hero.subtitle1')}
                </p>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-body font-light tracking-normal max-w-3xl mx-auto lg:mx-0 break-words hyphens-auto">
                  {t('hero.subtitle2')}
                </p>
              </div>
            </div>
          </div>
          
          {/* Right Column: Photo + Form Card - Separate card with lighter background, positioned above badge on desktop */}
          <div className={`w-full max-w-[380px] mx-auto lg:mx-0 relative order-2 lg:order-2 lg:-mt-20 ${isRTL ? 'lg:order-1' : ''}`} style={{ perspective: '1000px' }}>
            <div className="glass-card rounded-2xl border border-primary/10 backdrop-blur-sm shadow-lg overflow-hidden">
              <div className={`relative transition-transform duration-700 ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
                {/* Front - Photo + Form */}
                <div className={`${isFlipped ? 'invisible' : 'visible'}`} style={{ backfaceVisibility: 'hidden' }}>
                  {/* Form - Photo and fields inside form with same padding, made taller */}
                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5 lg:space-y-6 p-5 md:p-6 lg:p-7">
                    {/* Secretary Photo - Inside form, fills container fully */}
                    <div className="w-full overflow-hidden aspect-[4/3] lg:aspect-[4/3.5] bg-muted/20 opacity-70 dark:opacity-70 lg:opacity-100 rounded-lg">
                      <img 
                        src={professionalWoman} 
                        alt="Professional consultation"
                        width="400"
                        height="300"
                        className="w-full h-full object-cover object-center"
                        style={{ objectPosition: 'center 25%' }}
                        loading="eager"
                        decoding="async"
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="name" className={`text-sm md:text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold break-words block ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('contact.nameLabel')} *
                      </Label>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="h-14 md:h-14 lg:h-12 !border-2 dark:!border-primary/20 light:!border-primary/30 bg-blue-50/30 dark:bg-blue-950/30 backdrop-blur text-sm md:text-base w-full rounded-md px-4 outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="email" className={`text-sm md:text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold break-words block ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('contact.emailLabel')} *
                      </Label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="h-14 md:h-14 lg:h-12 !border-2 dark:!border-primary/20 light:!border-primary/30 bg-blue-50/30 dark:bg-blue-950/30 backdrop-blur text-sm md:text-base w-full rounded-md px-4 outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>
                    <div className="space-y-2.5">
                      <Label htmlFor="country" className={`text-sm md:text-base bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent font-semibold break-words block ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('contact.countryLabel')}
                      </Label>
                      <Select
                        value={formData.country}
                        onValueChange={(value) => setFormData({...formData, country: value})}
                      >
                        <SelectTrigger className={`!h-14 md:!h-14 lg:!h-12 !border-2 dark:!border-primary/20 light:!border-primary/30 !bg-blue-50/30 dark:!bg-blue-950/30 hover:!bg-blue-50/30 dark:hover:!bg-blue-950/30 focus:!bg-blue-50/30 dark:focus:!bg-blue-950/30 backdrop-blur touch-manipulation w-full !leading-tight !text-sm md:!text-base [&>span]:bg-gradient-to-r [&>span]:from-slate-500 [&>span]:to-slate-700 [&>span]:bg-clip-text [&>span]:text-transparent !shadow-none hover:!shadow-none focus:!shadow-none ${isRTL ? 'flex-row-reverse text-right' : ''}`}>
                          <SelectValue placeholder={t('contact.countryPlaceholder')} />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-card dark:border-border bg-background border-2 z-[100]">
                          {["USA", "UK", "Canada", "Australia", "South Africa", "Brazil", "Argentina", "Mexico", "Venezuela", "Israel", "Germany", "France", "Other"].map((country) => (
                            <SelectItem key={country} value={country} className="cursor-pointer hover:bg-primary/10 text-sm">
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <button
                      type="submit"
                      className="w-full h-auto min-h-[56px] md:min-h-[56px] lg:min-h-[64px] py-3.5 md:py-3.5 lg:py-4 px-4 dark:bg-card/60 light:bg-gradient-to-br light:from-[hsl(220_90%_25%)] light:to-[hsl(220_90%_18%)] rounded-md font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl border dark:border-primary/20 light:border-primary/30 !mt-6 break-words hyphens-auto [&_span]:text-base md:[&_span]:text-lg [&_span]:leading-tight"
                    >
                      <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent inline-block">{t('contact.requestInfo')}</span>
                    </button>
                  </form>
                </div>
                
                {/* Back - Success */}
                <div className={`absolute inset-0 ${isFlipped ? 'visible' : 'invisible'}`} style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8 px-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold">{t('contact.successTitle')}</h3>
                    <p className="text-foreground/70">{t('contact.successMessage')}</p>
                    <button
                      onClick={() => setIsFlipped(false)}
                      className="mt-4 text-primary hover:underline"
                    >
                      {t('contact.submitAnother')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Cards - Full width below form bottom edge on desktop, square and centered on mobile */}
        <div className="mt-12 md:mt-16 lg:mt-32 order-3 lg:order-none">
          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-4 md:gap-5 lg:gap-6 w-full max-w-sm sm:max-w-7xl mx-auto px-4 sm:px-0 items-center sm:items-stretch">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <div 
                  key={index}
                  className="glass-card hover-glow rounded-lg text-center px-5 py-4 md:px-6 md:py-5 lg:px-6 lg:py-5 backdrop-blur-md border dark:border-primary/20 light:border-primary/30 dark:bg-card/60 light:bg-gradient-to-br light:from-[hsl(220_90%_25%)] light:to-[hsl(220_90%_18%)] transition-all duration-300 hover:scale-105 hover:shadow-2xl light:hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] w-full sm:w-auto aspect-square sm:aspect-auto"
                >
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 md:gap-3">
                    <FeatureIcon className="w-5 h-5 md:w-6 md:h-6 dark:text-primary light:text-white/90 dark:drop-shadow-[0_0_8px] dark:drop-shadow-primary/50 light:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" strokeWidth={1.5} />
                    <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold dark:text-primary light:text-white dark:drop-shadow-[0_0_10px] dark:drop-shadow-primary/60 light:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]" dir="ltr">{feature.stat}</h3>
                    <p className="text-xs sm:text-sm md:text-base font-semibold dark:bg-gradient-to-r dark:from-primary dark:to-secondary dark:bg-clip-text dark:text-transparent light:from-gray-100 light:to-white light:text-gray-100 light:drop-shadow-[0_0_4px_rgba(255,255,255,0.5)] leading-tight break-words px-2" style={{ hyphens: 'none', wordBreak: 'break-word' }}>{feature.text}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Social Share Buttons */}
        <div className="mt-32 md:mt-40 lg:mt-48 flex justify-center">
          <SocialShare 
            title={t('hero.title')}
            description={t('hero.subtitle1')}
            variant="minimal"
          />
        </div>
      </div>
    </section>
  );
};
