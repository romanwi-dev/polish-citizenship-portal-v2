import { Check, Train, Plane, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { MainCTA } from "./ui/main-cta";
import { useTranslation } from 'react-i18next';
import { useState } from "react";
import { SectionLayout } from "./layout/SectionLayout";

const FlippablePricingCard = ({ 
  icon: Icon, 
  title, 
  subtitle, 
  price, 
  installment, 
  timeline, 
  features, 
  buttonText, 
  gradient, 
  iconColor, 
  checkColor, 
  badge,
  onClick 
}: { 
  icon: any; 
  title: string; 
  subtitle: string; 
  price: string; 
  installment: string; 
  timeline: string; 
  features: string[]; 
  buttonText: string; 
  gradient: string; 
  iconColor: string; 
  checkColor: string; 
  badge?: { text: string; colors: string };
  onClick: () => void;
}) => {
  const { t } = useTranslation();
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="h-[700px] cursor-pointer"
      style={{ 
        perspective: '1000px'
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className="relative w-full h-full transition-transform duration-700"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front */}
        <div 
          className={`absolute inset-0 glass-card p-8 rounded-3xl hover-glow flex flex-col ${badge ? 'border-2 border-primary/50' : ''}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {badge && (
            <div className={`absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full ${badge.colors} text-white text-sm font-semibold whitespace-nowrap min-w-[120px] text-center`}>
              {badge.text}
            </div>
          )}
          
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-full ${gradient} flex items-center justify-center`}>
              <Icon className={`w-6 h-6 ${iconColor}`} />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold leading-tight break-words hyphens-auto">{title}</h3>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          
          <div className="mb-6">
            <div className={`text-3xl font-bold bg-clip-text text-transparent mb-2 ${gradient.replace('bg-gradient-to-br', 'bg-gradient-to-r')}`}>
              {price}
            </div>
            <div className="text-sm text-muted-foreground">{installment}</div>
          </div>

          <div className="mb-6">
            <div className="text-sm text-muted-foreground mb-1">{t('pricing.timelineLabel')}</div>
            <div className="text-lg font-semibold">{timeline}</div>
          </div>

          <ul className="space-y-3 mb-8 flex-1">
            {features.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className={`w-5 h-5 ${checkColor} mt-0.5 flex-shrink-0`} />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-4">
            <Button 
              className="w-full bg-primary/10 hover:bg-primary/20 text-primary border-2 border-primary/30 hover:border-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] transition-all duration-300 hover:scale-105" 
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              {buttonText}
            </Button>
          </div>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 glass-card p-8 rounded-3xl flex items-center justify-center"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className={`absolute inset-0 ${gradient} opacity-20 rounded-3xl`} />
          <div className="relative z-10 text-center">
            <p className="text-muted-foreground italic">
              {t('pricing.flipBack')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PricingSection = () => {
  const { t } = useTranslation();
  
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <SectionLayout
      id="pricing"
      badge={{ icon: Zap, text: t('pricing.badge') }}
      title={t('pricing.title')}
      subtitle={t('pricing.subtitle')}
      cta={<MainCTA onClick={scrollToContact} ariaLabel="Contact us">{t('pricing.cta')}</MainCTA>}
    >
      <div className="max-w-6xl mx-auto">
        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
            <FlippablePricingCard
              icon={Train}
              title={t('pricing.standard')}
              subtitle={t('pricing.standardSubtitle')}
              price={t('pricing.standardPrice')}
              installment={t('pricing.standardInstallment')}
              timeline={t('pricing.standardTimeline')}
              features={[
                t('pricing.standardFeature1'),
                t('pricing.standardFeature2'),
                t('pricing.standardFeature3'),
                t('pricing.standardFeature4'),
                t('pricing.standardFeature5')
              ]}
              buttonText={t('pricing.standardButton')}
              gradient="bg-gradient-to-br from-primary/20 to-secondary/20"
              iconColor="text-primary"
              checkColor="text-primary"
              onClick={scrollToContact}
            />

            <FlippablePricingCard
              icon={Plane}
              title={t('pricing.expedited')}
              subtitle={t('pricing.expeditedSubtitle')}
              price={t('pricing.expeditedPrice')}
              installment={t('pricing.expeditedInstallment')}
              timeline={t('pricing.expeditedTimeline')}
              features={[
                t('pricing.expeditedFeature1'),
                t('pricing.expeditedFeature2'),
                t('pricing.expeditedFeature3'),
                t('pricing.expeditedFeature4'),
                t('pricing.expeditedFeature5'),
                t('pricing.expeditedFeature6')
              ]}
              buttonText={t('pricing.expeditedButton')}
              gradient="bg-gradient-to-br from-secondary/20 to-accent/20"
              iconColor="text-secondary"
              checkColor="text-secondary"
              badge={{ text: t('pricing.expeditedBadge'), colors: "bg-gradient-to-r from-primary to-secondary" }}
              onClick={scrollToContact}
            />

            <FlippablePricingCard
              icon={Zap}
              title={t('pricing.vip')}
              subtitle={t('pricing.vipSubtitle')}
              price={t('pricing.vipPrice')}
              installment={t('pricing.vipInstallment')}
              timeline={t('pricing.vipTimeline')}
              features={[
                t('pricing.vipFeature1'),
                t('pricing.vipFeature2'),
                t('pricing.vipFeature3'),
                t('pricing.vipFeature4'),
                t('pricing.vipFeature5'),
                t('pricing.vipFeature6'),
                t('pricing.vipFeature7')
              ]}
              buttonText={t('pricing.vipButton')}
              gradient="bg-gradient-to-br from-accent/20 to-primary/20"
              iconColor="text-accent"
              checkColor="text-accent"
              badge={{ text: "Waitlist...", colors: "bg-gradient-to-r from-accent/80 to-primary/80" }}
              onClick={scrollToContact}
            />
          </div>
        </div>
    </SectionLayout>
  );
};

export default PricingSection;