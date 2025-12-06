import { Star, Quote, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MainCTA } from '@/components/ui/main-cta';
import { useTranslation } from 'react-i18next';
import { SectionLayout } from './layout/SectionLayout';
import { getStaggerDelay } from '@/config/animations';
import { memo, useCallback } from 'react';

export default memo(function TestimonialsSection() {
  const { t } = useTranslation();
  const rawTestimonials = t('testimonials.reviews', { returnObjects: true });
  const testimonials = (Array.isArray(rawTestimonials) ? rawTestimonials : []) as Array<{
    name: string;
    location: string;
    heritage: string;
    text: string;
    timeline: string;
    year: string;
  }>;
  
  const handleContactClick = useCallback(() => {
    window.location.hash = 'contact';
  }, []);
  
  return (
    <SectionLayout
      id="testimonials"
      badge={{ icon: Award, text: t('testimonials.badge', 'Client Success Stories') }}
      title={t('testimonials.title')}
      subtitle={
        <div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto font-body font-light tracking-normal">
            {t('testimonials.subtitle')}
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {t('testimonials.rating')}
            </span>
          </div>
        </div>
      }
      cta={<MainCTA onClick={handleContactClick} ariaLabel="Contact us">{t('testimonials.cta')}</MainCTA>}
    >
      {/* Testimonials Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm hover:scale-105 hover:-translate-y-1 animate-fade-in w-full max-w-[480px] md:max-w-[380px] mx-auto"
              style={{ animationDelay: `${getStaggerDelay(index)}ms` }}
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-foreground/90 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>

                {/* Client Info */}
                <div className="border-t border-border/50 pt-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.location}
                      </p>
                      <p className="text-xs text-primary/70 mt-1">
                        {testimonial.heritage}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-accent">
                        {testimonial.timeline}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.year}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Five Sequential Arrows Animation */}
        <div
          className="flex justify-center mt-8 mb-4 relative z-10"
        >
          <button className="px-8 py-4 bg-primary/10 hover:bg-primary/20 text-primary border-2 border-primary/30 hover:border-primary/50 shadow-[0_0_20px_hsl(var(--primary)/0.2)] hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] transition-all duration-300 hover:scale-105 rounded-lg font-semibold">
            Request Video Testimonials
          </button>
        </div>
    </SectionLayout>
  );
});
