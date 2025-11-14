import Navigation from "@/components/Navigation";
import AboutSection from "@/components/AboutSection";
import ServicesWeb3 from "@/components/ServicesWeb3";
import FooterWeb3 from "@/components/FooterWeb3";
import { GlobalBackground } from "@/components/GlobalBackground";

const TranslationDemo = () => {
  return (
    <div className="min-h-screen overflow-x-hidden relative">
      {/* Background - Theme-aware (3D for dark, plain for light) */}
      <GlobalBackground />
      
      {/* Content */}
      <div className="relative z-10">
        <Navigation />
        
        {/* Demo Indicator Badge */}
        <div className="fixed top-20 right-4 z-50 glass-card px-4 py-2 rounded-full border border-primary/30 shadow-lg">
          <span className="text-sm font-medium text-primary">
            🌐 Translation & Theme Demo
          </span>
        </div>
        
        <div className="pt-20">
          <AboutSection />
          <ServicesWeb3 />
        </div>
        <FooterWeb3 />
      </div>
    </div>
  );
};

export default TranslationDemo;
