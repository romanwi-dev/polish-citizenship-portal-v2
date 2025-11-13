import { MainCTA } from "@/components/ui/main-cta";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import warsawHero from "@/assets/warsaw-modern-skyline.jpg";
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
          
          <MainCTA
            wrapperClassName="flex justify-center animate-fade-in"
            onClick={() => window.open('https://polishcitizenship.typeform.com/to/PS5ecU?typeform-source=polishcitizenship.pl', '_blank')}
            ariaLabel="Take the Polish Citizenship Test to check your eligibility"
          >
            Take Polish Citizenship Test
          </MainCTA>
        </div>
      </div>

      {/* Warsaw Hero Image - Full Width Background */}
      <div className="w-full mb-32 md:mb-20">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in max-w-6xl mx-auto" style={{ animationDelay: '200ms' }}>
            {/* Card 1 - Not Flippable */}
            <div 
              className="glass-card p-6 rounded-lg hover-glow text-center relative h-[140px] md:h-[160px] flex items-center justify-center w-full max-w-[280px] mx-auto md:max-w-none"
            >
              <div className="w-full h-full flex flex-col items-center justify-center">
                <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">&gt;20</h3>
                <p className="text-sm md:text-base font-medium bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Years of Experience</p>
              </div>
            </div>

            {/* Card 2 - Not Flippable */}
            <div 
              className="glass-card p-6 rounded-lg hover-glow text-center relative h-[140px] md:h-[160px] flex items-center justify-center w-full max-w-[280px] mx-auto md:max-w-none"
            >
              <div className="w-full h-full flex flex-col items-center justify-center">
                <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent mb-2">&gt;20,000</h3>
                <p className="text-sm md:text-base font-medium bg-gradient-to-r from-secondary to-accent bg-clip-text text-transparent">Cases Processed</p>
              </div>
            </div>

            {/* Card 3 - Not Flippable */}
            <div 
              className="glass-card p-6 rounded-lg hover-glow text-center relative h-[140px] md:h-[160px] flex items-center justify-center w-full max-w-[280px] mx-auto md:max-w-none"
            >
              <div className="w-full h-full flex flex-col items-center justify-center">
                <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-2">100%</h3>
                <p className="text-sm md:text-base font-medium bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroWeb3;