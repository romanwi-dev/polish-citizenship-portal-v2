import { GlobalBackground } from "@/components/GlobalBackground";
import { SkipToContent } from "@/components/ui/skip-to-content";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";

// Direct imports for all components
import Navigation from "@/components/Navigation";
import { HeroWavingFlags } from "@/components/heroes/premium/HeroWavingFlags";
import { WarsawSkyline } from "@/components/WarsawSkyline";
import { BudapestSkyline } from "@/components/BudapestSkyline";
import { BerlinSkyline } from "@/components/BerlinSkyline";
import AboutSection from "@/components/AboutSection";
import AIAnalysisSection from "@/components/AIAnalysisSection";
import ServicesWeb3 from "@/components/ServicesWeb3";
import ClientOnboardingSection from "@/components/ClientOnboardingSection";
import TimelineProcessEnhanced from "@/components/TimelineProcessEnhanced";
import PricingSection from "@/components/PricingSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FAQSection from "@/components/FAQSection";
import ContactFormWeb3 from "@/components/ContactFormWeb3";
import FooterWeb3 from "@/components/FooterWeb3";
import ScrollToTop from "@/components/ScrollToTop";

const Index = () => {
  return (
    <>
      {/* Skip to content link for accessibility */}
      <SkipToContent />
      
      {/* SEO Meta Tags */}
      <SEOHead page="home" />
      <StructuredData />
      
      {/* No image preloading needed - using design system only */}
      
      <div className="min-h-screen overflow-x-hidden relative">
        {/* Unified Background - Single 3D Canvas for optimal performance */}
        <GlobalBackground />
        
        {/* Main content container */}
        <div className="relative z-10">
          {/* Navigation */}
          <Navigation />
          
          {/* Main content with semantic HTML for accessibility and SEO */}
          <main 
            id="main-content" 
            role="main" 
            aria-label="Main content"
          >
            {/* Hero Section - Critical above-the-fold content */}
            <HeroWavingFlags />
            
            {/* About Section */}
            <AboutSection />
            
            {/* AI Analysis Section */}
            <AIAnalysisSection />
            
            {/* Services Section */}
            <ServicesWeb3 />
            
            <div className="my-16 md:my-24">
              <WarsawSkyline />
            </div>
        
        <div className="my-16 md:my-24">
          <BudapestSkyline />
        </div>
        
        <TimelineProcessEnhanced />
        
        <div className="my-16 md:my-24">
          <BerlinSkyline />
        </div>
        
        <ClientOnboardingSection />
        
        <PricingSection />
        
        <TestimonialsSection />
        
        <FAQSection />
        
        <ContactFormWeb3 />
        
        <FooterWeb3 />
        
        <ScrollToTop />
          </main>
        </div>
      </div>
    </>
  );
};

export default Index;
