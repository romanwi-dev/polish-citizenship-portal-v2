import { Button } from "@/components/ui/button";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import { Shield, Users, Globe } from "lucide-react";
import warsawLineart from "@/assets/warsaw-lineart.png";
import { useState } from "react";

const HeroWeb3 = () => {
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  const toggleFlip = (id: string) => {
    setFlippedCards(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  return <section className="relative min-h-[60vh] md:min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Content */}
      <div className="container relative z-10 px-4 pt-32 pb-20 mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-12 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-16 animate-fade-in w-fit max-w-[280px] mx-auto md:max-w-none">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Web3 Legal Services</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-black mb-14 leading-tight animate-fade-in tracking-tight" style={{
          contentVisibility: 'auto'
        }}>
            <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent glow-text">
              Polish Citizenship by Descent
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground font-light mb-12 md:mb-16 leading-relaxed max-w-full md:max-w-[95%] animate-fade-in mx-auto px-4 md:px-0">
            Expert legal guidance for people of Polish and Polish-Jewish descent from around the world for obtaining Polish citizenship and EU passports through Polish ancestry - unmatched success rate, true realistic timeline, transparent pricing
          </p>
          
          <div className="flex justify-center animate-fade-in">
            <Button size="lg" className="text-lg md:text-2xl font-bold px-8 py-4 md:px-20 md:py-6 h-auto min-h-[48px] rounded-lg bg-red-700 dark:bg-red-900/60 hover:bg-red-800 dark:hover:bg-red-900/70 text-white shadow-[0_0_40px_rgba(185,28,28,0.6)] dark:shadow-[0_0_40px_rgba(127,29,29,0.6)] hover:shadow-[0_0_60px_rgba(185,28,28,0.8)] dark:hover:shadow-[0_0_60px_rgba(127,29,29,0.8)] group relative overflow-hidden backdrop-blur-md border-2 border-red-600 dark:border-red-800/40 hover:border-red-500 dark:hover:border-red-700/60 transition-all duration-300 hover:scale-105 animate-pulse" onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')} aria-label="Take the Polish Citizenship Test to check your eligibility">
              <span className="relative z-10 font-bold drop-shadow-lg">
                Take Polish Citizenship Test
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-800/30 to-red-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </div>
        </div>
      </div>

      {/* Warsaw Skyline - Full Width Background */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] mb-12 md:mb-20 flex justify-center overflow-hidden">
        <img src={warsawLineart} alt="Warsaw skyline illustration" className="w-full max-w-5xl opacity-70 md:opacity-50 mx-auto" style={{
          mixBlendMode: 'screen',
          filter: 'invert(1) brightness(0.9)'
        }} />
      </div>

      {/* Stats Badges */}
      <div className="container relative z-10 px-4 mx-auto pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {/* Card 1 */}
            <div 
              className="glass-card p-6 rounded-lg hover-glow text-center cursor-pointer relative h-[140px] md:h-[160px]"
              onClick={() => toggleFlip('card1')}
              style={{ perspective: '1000px' }}
            >
              <div 
                className="relative w-full h-full transition-transform duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flippedCards['card1'] ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Front */}
                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">&gt;25 Years of Experience</h3>
                </div>
                {/* Back */}
                <div className="absolute inset-0 flex items-center justify-center p-4" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <p className="text-sm text-muted-foreground">Serving clients worldwide since 2003</p>
                </div>
              </div>
            </div>
            
            {/* Card 2 */}
            <div 
              className="glass-card p-6 rounded-lg hover-glow text-center cursor-pointer relative h-[140px] md:h-[160px]"
              onClick={() => toggleFlip('card2')}
              style={{ perspective: '1000px' }}
            >
              <div 
                className="relative w-full h-full transition-transform duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flippedCards['card2'] ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Front */}
                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-secondary/20 to-accent/20 flex items-center justify-center">
                    <Users className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">&gt;25'000 Cases Processed</h3>
                </div>
                {/* Back */}
                <div className="absolute inset-0 flex items-center justify-center p-4" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <p className="text-sm text-muted-foreground">Successfully handled applications</p>
                </div>
              </div>
            </div>
            
            {/* Card 3 */}
            <div 
              className="glass-card p-6 rounded-lg hover-glow text-center cursor-pointer relative h-[140px] md:h-[160px]"
              onClick={() => toggleFlip('card3')}
              style={{ perspective: '1000px' }}
            >
              <div 
                className="relative w-full h-full transition-transform duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flippedCards['card3'] ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Front */}
                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">100% Unmatched Success Rate</h3>
                </div>
                {/* Back */}
                <div className="absolute inset-0 flex items-center justify-center p-4" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <p className="text-sm text-muted-foreground">Proven track record of excellence</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroWeb3;