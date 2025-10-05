import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { Hero3DMap } from "./Hero3DMap";

const HeroWeb3 = () => {
  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Hero3DMap />
      </div>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/50 to-background z-[1]" />
      
      {/* Animated Glow Orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse z-[1]" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary/20 rounded-full blur-[120px] animate-pulse delay-700 z-[1]" />

      {/* Content */}
      <div className="container relative z-10 px-4 pt-24 pb-20 mx-auto">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-12 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Web3 Legal Services</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-10 leading-tight animate-fade-in">
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text">
              Polish Citizenship by Descent
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto animate-fade-in">
            Expert legal guidance for people of Polish and Polish-Jewish descent from around the world for obtaining Polish citizenship and EU passports through Polish ancestry - unmatched 100% success rate, true realist timeline 1,5 - 4 years, transparent pricing €3,500 - €12,500+
          </p>
          
          <div className="flex justify-center animate-fade-in mb-16">
            <Button 
              size="lg" 
              className="text-2xl font-bold px-20 py-6 h-auto rounded-lg bg-white/5 hover:bg-white/10 shadow-glow hover-glow group relative overflow-hidden backdrop-blur-md border border-white/30"
              onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
            >
              <span className="relative z-10 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Polish Citizenship Test
              </span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { value: "2+ Years", label: "Realistic Timeline" },
              { value: "€3,500+", label: "Transparent Real Pricing" },
              { value: "100%", label: "True Success Rate" }
            ].map((stat, i) => (
              <div key={i} className="glass-card p-6 rounded-lg hover-glow">
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroWeb3;