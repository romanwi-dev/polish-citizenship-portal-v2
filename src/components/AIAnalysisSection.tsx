import { Brain, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";


const FlippableAICard = ({ 
  icon: Icon, 
  title, 
  description, 
  gradient, 
  textColor, 
  index 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  gradient: string; 
  textColor: string; 
  index: number;
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="h-[280px] cursor-pointer"
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
          className="absolute inset-0 glass-card p-8 rounded-lg hover-glow flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-center flex flex-col items-center justify-center">
            <div className={`w-14 h-14 mb-4 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <Icon className={`w-7 h-7 ${textColor}`} />
            </div>
            <h3 className="text-xl font-bold mb-3 font-heading">{title}</h3>
            <p className="text-base text-muted-foreground leading-relaxed font-body font-light text-center">
              {description}
            </p>
          </div>
        </div>

        {/* Back */}
        <div 
          className="absolute inset-0 glass-card p-8 rounded-lg flex items-center justify-center"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20 rounded-lg`} />
          <div className="relative z-10 text-center">
            <p className="text-muted-foreground italic">
              Click to flip back
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const AIAnalysisSection = () => {
  return (
    <section className="relative py-24 overflow-hidden overflow-x-hidden">
      
      <div className="container relative z-10 px-4 mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-16">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">AI-Powered Analysis</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-14">
              <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Deep Detailed Case Analysis
              </span>
            </h2>
            
            <div className="mb-16 max-w-6xl mx-auto px-2 md:px-0">
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6 font-body font-light tracking-normal">
                Using AI technology combined with 20+ years of case data, we predict your success probability and timeline with exceptional accuracy—before you even start. This means no surprises, realistic expectations, and a clear roadmap from day one.
              </p>
              
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-body font-light tracking-normal">
                Our advanced analysis identifies potential challenges early, giving you confidence and clarity throughout your citizenship journey. We're committed to honest, transparent guidance backed by data and decades of expertise.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            <FlippableAICard 
              icon={TrendingUp}
              title="Success Probability"
              description="Know your chances upfront. Our AI analyzes your family history and documents to predict your case outcome with proven accuracy."
              gradient="from-primary/20 to-secondary/20"
              textColor="text-primary"
              index={0}
            />

            <FlippableAICard 
              icon={Clock}
              title="Timeline & Costs"
              description="Get realistic timelines and transparent pricing from the start. No hidden fees, no surprises—just honest expectations based on your case."
              gradient="from-secondary/20 to-accent/20"
              textColor="text-secondary"
              index={1}
            />

            <FlippableAICard 
              icon={AlertTriangle}
              title="Early Risk Detection"
              description="We spot potential problems before they delay your case—missing documents, legal complications, or gaps in your family tree."
              gradient="from-accent/20 to-primary/20"
              textColor="text-accent"
              index={2}
            />
          </div>
          
          {/* CTA Button */}
          <div className="flex justify-center mt-40 mb-20 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <Button 
              size="lg" 
              className="w-full max-w-[280px] md:max-w-none md:w-auto text-xl md:text-2xl font-bold px-12 py-6 md:px-20 md:py-6 h-auto min-h-[64px] md:min-h-[72px] rounded-lg bg-red-700 dark:bg-red-900/60 hover:bg-red-800 dark:hover:bg-red-900/70 text-white shadow-[0_0_40px_rgba(185,28,28,0.6)] dark:shadow-[0_0_40px_rgba(127,29,29,0.6)] hover:shadow-[0_0_60px_rgba(185,28,28,0.8)] dark:hover:shadow-[0_0_60px_rgba(127,29,29,0.8)] group relative overflow-hidden backdrop-blur-md border-2 border-red-600 dark:border-red-800/40 hover:border-red-500 dark:hover:border-red-700/60 transition-all duration-300 hover:scale-105 animate-pulse" 
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
      </div>
    </section>
  );
};

export default AIAnalysisSection;