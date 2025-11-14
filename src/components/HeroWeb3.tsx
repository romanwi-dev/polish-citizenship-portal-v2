import { MainCTA } from "@/components/ui/main-cta";
import Sparkles from "lucide-react/dist/esm/icons/sparkles";
import { useState } from "react";
import warsawNightHolographic from "@/assets/hero/warsaw-night-holographic.jpg";

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
            <span className="bg-gradient-to-r from-[#7C1328] via-[#D94565] to-white bg-clip-text text-transparent" style={{
              textShadow: '0 0 60px rgba(217, 69, 101, 0.6), 0 0 100px rgba(255, 255, 255, 0.4)'
            }}>
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


      {/* Stats Badges */}
      <div className="container relative z-10 px-4 mx-auto pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in max-w-6xl mx-auto" style={{ animationDelay: '200ms' }}>
            {/* Card 1 */}
            <div 
              className="p-6 rounded-lg text-center relative h-[140px] md:h-[160px] flex items-center justify-center w-full max-w-[280px] mx-auto md:max-w-none"
              style={{
                background: 'linear-gradient(135deg, rgba(124, 19, 40, 0.2) 0%, rgba(74, 12, 24, 0.3) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(124, 19, 40, 0.3)'
              }}
            >
              <div className="w-full h-full flex flex-col items-center justify-center">
                <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#7C1328] to-[#D94565] bg-clip-text text-transparent mb-2">&gt;20</h3>
                <p className="text-base md:text-lg font-medium bg-gradient-to-r from-[#7C1328] to-[#D94565] bg-clip-text text-transparent">Years of Experience</p>
              </div>
            </div>

            {/* Card 2 */}
            <div 
              className="p-6 rounded-lg text-center relative h-[140px] md:h-[160px] flex items-center justify-center w-full max-w-[280px] mx-auto md:max-w-none"
              style={{
                background: 'linear-gradient(135deg, rgba(124, 19, 40, 0.25) 0%, rgba(74, 12, 24, 0.35) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(124, 19, 40, 0.4)'
              }}
            >
              <div className="w-full h-full flex flex-col items-center justify-center">
                <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#8B1D3D] to-[#E05575] bg-clip-text text-transparent mb-2">&gt;20,000</h3>
                <p className="text-base md:text-lg font-medium bg-gradient-to-r from-[#8B1D3D] to-[#E05575] bg-clip-text text-transparent">Cases Processed</p>
              </div>
            </div>

            {/* Card 3 */}
            <div 
              className="p-6 rounded-lg text-center relative h-[140px] md:h-[160px] flex items-center justify-center w-full max-w-[280px] mx-auto md:max-w-none"
              style={{
                background: 'linear-gradient(135deg, rgba(124, 19, 40, 0.3) 0%, rgba(74, 12, 24, 0.4) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(124, 19, 40, 0.5)'
              }}
            >
              <div className="w-full h-full flex flex-col items-center justify-center">
                <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#A01D48] to-[#F06585] bg-clip-text text-transparent mb-2">100%</h3>
                <p className="text-base md:text-lg font-medium bg-gradient-to-r from-[#A01D48] to-[#F06585] bg-clip-text text-transparent">Success Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HeroWeb3;