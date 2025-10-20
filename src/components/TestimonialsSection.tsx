import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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
    <section id="testimonials" className="py-24 px-4 bg-gradient-to-b from-background via-background/95 to-background">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Success Stories
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

        {/* CTA */}
        <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <p className="text-muted-foreground mb-4">
            Join hundreds of satisfied clients who successfully reclaimed their Polish citizenship
          </p>
          <a 
            href="#contact" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            Start Your Journey
          </a>
        </div>
      </div>
    </section>
  );
}
