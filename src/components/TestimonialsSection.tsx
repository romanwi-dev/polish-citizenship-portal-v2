import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { MainCTA } from '@/components/ui/main-cta';
import { useTranslation } from 'react-i18next';

export default function TestimonialsSection() {
  const { t } = useTranslation();
  const testimonials = t('testimonials.reviews', { returnObjects: true }) as Array<{
    name: string;
    location: string;
    heritage: string;
    text: string;
    timeline: string;
    year: string;
  }>;
  
  return (
    <section id="testimonials" className="py-24 px-4 overflow-x-hidden">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-14">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              {t('testimonials.title')}
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
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

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm hover:scale-105 hover:-translate-y-1 animate-fade-in w-full max-w-[480px] md:max-w-[380px] mx-auto"
              style={{ animationDelay: `${index * 100}ms` }}
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
          className="flex justify-center mt-8 mb-2 cursor-pointer hover:opacity-80 transition-opacity relative z-10"
          onClick={() => {
            const videoButton = document.getElementById('video-testimonials-cta');
            if (videoButton) {
              videoButton.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }}
        >
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[14px] border-l-transparent border-r-transparent border-t-primary/20 animate-[bounce_1.5s_ease-in-out_infinite]" 
              style={{ animationDelay: '0s' }} />
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[14px] border-l-transparent border-r-transparent border-t-primary/40 animate-[bounce_1.5s_ease-in-out_infinite]" 
              style={{ animationDelay: '0.15s' }} />
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[14px] border-l-transparent border-r-transparent border-t-primary/60 animate-[bounce_1.5s_ease-in-out_infinite]" 
              style={{ animationDelay: '0.3s' }} />
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[14px] border-l-transparent border-r-transparent border-t-primary/80 animate-[bounce_1.5s_ease-in-out_infinite]" 
              style={{ animationDelay: '0.45s' }} />
            <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-t-[14px] border-l-transparent border-r-transparent border-t-primary animate-[bounce_1.5s_ease-in-out_infinite]" 
              style={{ animationDelay: '0.6s' }} />
          </div>
        </div>

        <div id="video-testimonials-cta" className="flex justify-center animate-fade-in">
          <MainCTA
            onClick={() => {
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            ariaLabel="Request video testimonials - scroll to contact form"
          >
            <span className="flex items-center gap-3">
              <svg 
                className="w-6 h-6" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Watch Video Testimonials
            </span>
          </MainCTA>
        </div>

      </div>
    </section>
  );
}
