import Navigation from "@/components/Navigation";
import HeroWeb3 from "@/components/HeroWeb3";
import AboutSection from "@/components/AboutSection";
import AIAnalysisSection from "@/components/AIAnalysisSection";
import ServicesWeb3 from "@/components/ServicesWeb3";
import ClientOnboardingSection from "@/components/ClientOnboardingSection";
import TimelineProcessEnhanced from "@/components/TimelineProcessEnhanced";
import PricingSection from "@/components/PricingSection";
import FAQSection from "@/components/FAQSection";
import ContactFormWeb3 from "@/components/ContactFormWeb3";
import FooterWeb3 from "@/components/FooterWeb3";
import ScrollToTop from "@/components/ScrollToTop";

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navigation />
      <HeroWeb3 />
      <AboutSection />
      <AIAnalysisSection />
      <ServicesWeb3 />
      <TimelineProcessEnhanced />
      <ClientOnboardingSection />
      <PricingSection />
      <FAQSection />
      <ContactFormWeb3 />
      <FooterWeb3 />
      <ScrollToTop />
    </div>
  );
};

export default Index;