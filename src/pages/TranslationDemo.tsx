import Navigation from "@/components/Navigation";
import AboutSection from "@/components/AboutSection";
import ServicesWeb3 from "@/components/ServicesWeb3";
import DemoHeroWithImage from "@/components/demo/DemoHeroWithImage";
import DemoFooterSection from "@/components/demo/DemoFooterSection";
import SkylineDivider from "@/components/SkylineDivider";
import { GlobalBackground } from "@/components/GlobalBackground";

// Import European city skyline silhouettes
import pragueSkyline from "@/assets/skylines/prague.png";
import budapestSkyline from "@/assets/skylines/budapest.png";

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
        
        {/* Hero Section with Warsaw Image */}
        <DemoHeroWithImage />
        
        {/* About Section */}
        <AboutSection />
        
        {/* Prague Skyline Divider */}
        <SkylineDivider imageSrc={pragueSkyline} alt="Prague skyline" />
        
        {/* Services Section */}
        <ServicesWeb3 />
        
        {/* Budapest Skyline Divider */}
        <SkylineDivider imageSrc={budapestSkyline} alt="Budapest skyline" />
        
        {/* Footer Section with Landmark Unity Background */}
        <DemoFooterSection />
      </div>
    </div>
  );
};

export default TranslationDemo;
