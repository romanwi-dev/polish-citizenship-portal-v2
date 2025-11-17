import { FileSearch, Scale, Database, Globe, FileCheck, FileText, Send, Clock, CheckCircle, Award, CreditCard, Users } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { MainCTA } from '@/components/ui/main-cta';
import { memo, useCallback } from 'react';

const iconMap = {
  FileSearch,
  Scale,
  Database,
  Globe,
  FileCheck,
  FileText,
  Send,
  Clock,
  CheckCircle,
  Award,
  CreditCard,
  Users
};

const gradients = [
  "from-primary to-accent",
  "from-secondary to-primary",
  "from-accent to-secondary",
  "from-primary to-secondary",
  "from-secondary to-accent",
  "from-accent to-primary",
  "from-primary to-accent",
  "from-secondary to-primary",
  "from-accent to-secondary",
  "from-primary to-secondary",
  "from-secondary to-accent",
  "from-accent to-primary"
];

const icons = [
  'FileSearch', 'Scale', 'Database', 'Globe', 'FileCheck', 'FileText',
  'Send', 'Clock', 'CheckCircle', 'Award', 'CreditCard', 'Users'
];

const ProcessWeb3 = memo(() => {
  const { t } = useTranslation();
  
  const handleCTAClick = useCallback(() => {
    window.location.hash = 'contact';
  }, []);

  const steps = Array.from({ length: 12 }, (_, i) => {
    const stepNum = i + 1;
    return {
      icon: iconMap[icons[i] as keyof typeof iconMap],
      number: t(`process.step${stepNum}Number`),
      title: t(`process.step${stepNum}Title`),
      description: t(`process.step${stepNum}Desc`),
      duration: t(`process.step${stepNum}Duration`),
      phase: t(`process.step${stepNum}Phase`),
      gradient: gradients[i]
    };
  });
  
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container px-4 mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 font-heading tracking-tight">
            {t('process.title')}
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-body font-light tracking-normal">
            {t('process.subtitle')}
          </p>
        </div>

        {/* Process Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            
            return (
              <div
                key={index}
                className="group relative p-8 rounded-2xl bg-card/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-2 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  {/* Icon & Number */}
                  <div className="flex items-start justify-between mb-6">
                    <div className={`p-4 rounded-xl bg-gradient-to-br ${step.gradient} shadow-lg`}>
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <span className="text-5xl font-bold text-primary/10 font-heading">
                      {step.number}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold mb-3 font-heading tracking-tight text-foreground">
                    {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground mb-6 leading-relaxed font-body">
                    {step.description}
                  </p>

                  {/* Meta Information */}
                  <div className="flex flex-wrap gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="text-xs font-medium text-primary">{step.duration}</span>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/10 border border-accent/20">
                      <span className="text-xs font-medium text-accent">{step.phase}</span>
                    </div>
                  </div>
                </div>

                {/* Hover Effect Border */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/0 via-primary/0 to-accent/0 group-hover:from-primary/20 group-hover:via-accent/20 group-hover:to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center animate-fade-in">
          <div className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 backdrop-blur-sm border border-border/50 mb-8">
            <p className="text-lg font-semibold text-foreground">
              {t('process.totalTimeline')}
            </p>
          </div>
          <div>
            <MainCTA onClick={handleCTAClick} ariaLabel="Start your citizenship journey">
              {t('process.ctaText')}
            </MainCTA>
          </div>
        </div>
      </div>
    </section>
  );
});

ProcessWeb3.displayName = 'ProcessWeb3';

export default ProcessWeb3;