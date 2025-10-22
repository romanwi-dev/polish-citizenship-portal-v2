import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Users, Award } from "lucide-react";

const LightThemeHero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-card to-background">
      {/* Gradient Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-card border-2 border-border rounded-full shadow-[var(--shadow-card-light)] hover:shadow-[var(--shadow-elevated-light)] transition-all duration-300 hover:-translate-y-1">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="text-sm font-semibold text-foreground">
              Professional Legal Services
            </span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            Polish Citizenship
            <br />
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              by Descent
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Unlock your European heritage with expert legal guidance. 
            Navigate the citizenship process with confidence through our proven, streamlined approach.
          </p>

          {/* CTA Button */}
          <div className="pt-4">
            <Button
              size="lg"
              className="text-lg px-12 py-8 rounded-2xl bg-gradient-to-r from-primary to-secondary text-white border-2 border-primary/20 shadow-[var(--shadow-elevated-light)] hover:shadow-[var(--shadow-hover-light)] hover:-translate-y-1 transition-all duration-300 hover:scale-105"
              onClick={() => window.open('https://poland-citizenship-test.typeform.com/to/VWIaQFRG', '_blank')}
            >
              <span className="font-bold">Take Polish Citizenship Test</span>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto">
            {[
              { icon: TrendingUp, label: 'Years of Experience', value: '15+' },
              { icon: Users, label: 'Cases Processed', value: '10,000+' },
              { icon: Award, label: 'Success Rate', value: '98%' }
            ].map((stat, index) => (
              <div
                key={index}
                className="group bg-card border-2 border-border rounded-2xl p-8 shadow-[var(--shadow-card-light)] hover:shadow-[var(--shadow-elevated-light)] hover:-translate-y-2 transition-all duration-300"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="p-4 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-4xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LightThemeHero;
