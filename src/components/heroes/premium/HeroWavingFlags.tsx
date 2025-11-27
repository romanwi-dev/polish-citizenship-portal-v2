import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import { Button } from '@/components/ui/button';
import { Award, Users, Trophy, Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import professionalWoman from '@/assets/professional-woman.jpeg';
import { SocialShare } from '@/components/social/SocialShare';
import RealisticGlobe from '@/components/visuals/RealisticGlobe';
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
    <section className="relative min-h-screen flex flex-col lg:flex-row items-center justify-center lg:justify-between overflow-hidden bg-background px-4 lg:px-16 pt-28 pb-16 md:pt-40 md:pb-20 lg:pt-0 lg:pb-0">
      {/* Left Column: Content */}
      <div className="relative z-10 w-full lg:w-1/2 max-w-3xl mx-auto lg:mx-0">
        <div className="container px-4 mx-auto lg:px-0">
          {/* Desktop: Two column layout, Mobile: Stacked */}
          <div className="flex flex-col gap-8 lg:gap-8 xl:gap-10">
            {/* Badge + Title + Text */}
            <div className={`space-y-6 md:space-y-8 flex flex-col justify-start w-full ${isRTL ? 'lg:text-right' : 'lg:text-left'}`}>
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
            
            {/* Photo + Form Card */}
            <div className={`w-full max-w-[380px] mx-auto lg:mx-0 relative ${isRTL ? '' : ''}`} style={{ perspective: '1000px' }}>
            <div className="glass-card rounded-2xl border border-primary/10 backdrop-blur-sm shadow-lg overflow-hidden">
              <div className={`relative transition-transform duration-700 ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
                {/* Front - Photo + Form */}
              <div className={`${isFlipped ? 'invisible' : 'visible'}`} style={{ backfaceVisibility: 'hidden' }}>
                  {/* Form - Photo and fields inside form with same padding, made taller */}
                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-3.5 lg:space-y-4 p-6 md:p-6 lg:p-7">
                    {/* Secretary Photo - Inside form, fills container fully */}
                    <div className="w-full overflow-hidden aspect-[4/3.5] bg-muted/20 opacity-70 dark:opacity-70 lg:opacity-100 rounded-lg">
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
                    <div className="space-y-1.5">
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
                    <div className="space-y-1.5">
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
                    <div className="space-y-1.5">
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

          </div>
        </div>

        {/* Stats Cards - Below content */}
        <div className="mt-12 md:mt-16 lg:mt-8">
          <div className="flex flex-col sm:grid sm:grid-cols-3 gap-4 md:gap-5 lg:gap-6 w-full max-w-[280px] sm:max-w-7xl mx-auto px-4 sm:px-0 items-center sm:items-stretch">
            {features.map((feature, index) => {
              const FeatureIcon = feature.icon;
              return (
                <div 
                  key={index}
                  className="glass-card hover-glow rounded-lg text-center p-6 backdrop-blur-md border dark:border-primary/20 light:border-primary/30 dark:bg-card/60 light:bg-gradient-to-br light:from-[hsl(220_90%_25%)] light:to-[hsl(220_90%_18%)] transition-transform transition-shadow duration-300 hover:scale-[1.03] hover:shadow-2xl hover:shadow-primary/20 light:hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background w-full max-w-[280px] sm:max-w-none h-[180px] md:h-[200px] sm:h-auto flex items-center justify-center"
                  tabIndex={0}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                    <FeatureIcon className="w-6 h-6 md:w-7 md:h-7 dark:text-primary light:text-white/90 dark:drop-shadow-[0_0_8px] dark:drop-shadow-primary/50 light:drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" strokeWidth={1.5} />
                    <h3 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent dark:drop-shadow-[0_0_10px] dark:drop-shadow-primary/60 light:bg-clip-text light:text-transparent light:drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]" dir="ltr">{feature.stat}</h3>
                    <p className="text-sm md:text-base font-normal bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight break-words px-2" style={{ hyphens: 'none', wordBreak: 'break-word' }}>{feature.text}</p>
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

      {/* Right Column: Full-Screen Globe */}
      <div className="hidden lg:flex relative w-full lg:w-1/2 h-screen items-center justify-center">
        <RealisticGlobe />
      </div>
    </section>
  );
};
