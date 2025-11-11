import { Button } from "@/components/ui/button";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import warsawHero from "@/assets/warsaw-demos/warsaw-9.png";
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

      {/* Warsaw Hero Image - Full Width Background */}
      <div className="w-full mb-12 md:mb-20">
        <img 
          src={warsawHero} 
          alt="Cultural Hub - Theater with interactive light displays" 
          className="w-full h-auto opacity-60" 
          style={{
            filter: 'brightness(0.7)'
          }} 
        />
      </div>

      {/* Stats Badges */}
      <div className="container relative z-10 px-4 mx-auto pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {/* Card 1 */}
            <div 
              className="glass-card p-6 rounded-lg hover-glow text-center cursor-pointer relative h-[140px] md:h-[160px] flex items-center justify-center"
              onClick={() => toggleFlip('card1')}
            >
              <div 
                className="relative w-full h-full flex items-center justify-center transition-all duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flippedCards['card1'] ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Front */}
                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
                  <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">&gt;25</h3>
                  <p className="text-sm md:text-base font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Years of Experience</p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 flex items-center justify-center p-4" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <p className="text-sm text-muted-foreground">Serving clients worldwide since 2003</p>
                </div>
              </div>
            </div>
            
            {/* Card 2 */}
            <div 
              className="glass-card p-6 rounded-lg hover-glow text-center cursor-pointer relative h-[140px] md:h-[160px] flex items-center justify-center"
              onClick={() => toggleFlip('card2')}
            >
              <div 
                className="relative w-full h-full flex items-center justify-center transition-all duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flippedCards['card2'] ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Front */}
                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
                  <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-2">&gt;25'000</h3>
                  <p className="text-sm md:text-base font-medium bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Cases Processed</p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 flex items-center justify-center p-4" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <p className="text-sm text-muted-foreground">Successfully handled applications</p>
                </div>
              </div>
            </div>
            
            {/* Card 3 */}
            <div 
              className="glass-card p-6 rounded-lg hover-glow text-center cursor-pointer relative h-[140px] md:h-[160px] flex items-center justify-center"
              onClick={() => toggleFlip('card3')}
            >
              <div 
                className="relative w-full h-full flex items-center justify-center transition-all duration-500"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: flippedCards['card3'] ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Front */}
                <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backfaceVisibility: 'hidden' }}>
                  <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2">100%</h3>
                  <p className="text-sm md:text-base font-medium bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Unmatched Success Rate</p>
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