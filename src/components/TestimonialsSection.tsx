import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const testimonials = [
  {
    name: "Michael K.",
    location: "Chicago, USA",
    heritage: "Kraków ancestry",
    rating: 5,
    text: "After 18 months, I received my Polish citizenship confirmation. The team handled everything professionally - from archival research to the final decision. Worth every penny.",
    timeline: "18 months",
    year: "2024"
  },
  {
    name: "Sarah M.",
    location: "Toronto, Canada",
    heritage: "Warsaw lineage",
    rating: 5,
    text: "They found my great-grandfather's birth certificate in Polish archives that I couldn't locate myself. Their expertise in Polish law and archival research is unmatched.",
    timeline: "14 months",
    year: "2024"
  },
  {
    name: "David L.",
    location: "London, UK",
    heritage: "Gdańsk roots",
    rating: 5,
    text: "The entire process was transparent. Regular updates, clear explanations, and their PUSH strategy helped accelerate my case. Now holding my Polish passport!",
    timeline: "16 months",
    year: "2023"
  },
  {
    name: "Jennifer R.",
    location: "Sydney, Australia",
    heritage: "Poznań heritage",
    rating: 5,
    text: "From family tree verification to civil acts preparation, they guided me through every step. The translation service was impeccable - all documents certified perfectly.",
    timeline: "20 months",
    year: "2023"
  },
  {
    name: "Robert P.",
    location: "New York, USA",
    heritage: "Lwów ancestry",
    rating: 5,
    text: "Complex case with pre-WWII borders, but they navigated it flawlessly. Their knowledge of historical Polish territories and citizenship law is exceptional.",
    timeline: "22 months",
    year: "2024"
  },
  {
    name: "Anna T.",
    location: "Berlin, Germany",
    heritage: "Wrocław lineage",
    rating: 5,
    text: "Fast, efficient, and thoroughly professional. They handled all communications with Polish authorities in Warsaw, making the process stress-free for me.",
    timeline: "12 months",
    year: "2024"
  }
];

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-24 px-4 overflow-x-hidden">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-14">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              True Honest Testimonials From Our Real Clients
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real clients who reclaimed their Polish heritage and citizenship
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              5.0 average from 200+ clients
            </span>
          </div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index} 
              className="group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm hover:scale-105 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
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

        {/* CTA Button */}
        <div className="flex justify-center mt-40 mb-20 animate-fade-in px-4" style={{ animationDelay: '600ms' }}>
          <Button 
            size="lg" 
            className="w-full max-w-2xl text-xl md:text-2xl font-bold px-12 py-6 md:px-20 md:py-6 h-auto min-h-[64px] md:min-h-[72px] rounded-lg bg-red-700 dark:bg-red-900/60 hover:bg-red-800 dark:hover:bg-red-900/70 text-white shadow-[0_0_40px_rgba(185,28,28,0.6)] dark:shadow-[0_0_40px_rgba(127,29,29,0.6)] hover:shadow-[0_0_60px_rgba(185,28,28,0.8)] dark:hover:shadow-[0_0_60px_rgba(127,29,29,0.8)] group relative overflow-hidden backdrop-blur-md border-2 border-red-600 dark:border-red-800/40 hover:border-red-500 dark:hover:border-red-700/60 transition-all duration-300 hover:scale-105 animate-pulse" 
            onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
            aria-label="Take the Polish Citizenship Test to check your eligibility"
          >
            <span className="relative z-10 font-bold drop-shadow-lg">
              Take Polish Citizenship Test
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-red-800/30 to-red-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
        </div>

      </div>
    </section>
  );
}
