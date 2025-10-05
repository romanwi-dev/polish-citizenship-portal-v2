import Navigation from "@/components/Navigation";
import HeroWeb3 from "@/components/HeroWeb3";
import AboutSection from "@/components/AboutSection";
import AIAnalysisSection from "@/components/AIAnalysisSection";
import ServicesWeb3 from "@/components/ServicesWeb3";
import TimelineProcessEnhanced from "@/components/TimelineProcessEnhanced";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import ContactFormWeb3 from "@/components/ContactFormWeb3";
import FooterWeb3 from "@/components/FooterWeb3";

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navigation />
      <HeroWeb3 />
      <AboutSection />
      <AIAnalysisSection />
      <ServicesWeb3 />
      <TimelineProcessEnhanced />
      <PricingSection />
      <FAQSection />
      <ContactFormWeb3 />
      <FooterWeb3 />
    </div>
  );
};

export default Index;