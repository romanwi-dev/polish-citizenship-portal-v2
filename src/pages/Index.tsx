import { lazy, Suspense } from "react";
import Navigation from "@/components/Navigation";
import HeroWeb3 from "@/components/HeroWeb3";
import AboutSection from "@/components/AboutSection";

// Lazy load components below the fold
const AIAnalysisSection = lazy(() => import("@/components/AIAnalysisSection"));
const ServicesWeb3 = lazy(() => import("@/components/ServicesWeb3"));
const ClientOnboardingSection = lazy(() => import("@/components/ClientOnboardingSection"));
const TimelineProcessEnhanced = lazy(() => import("@/components/TimelineProcessEnhanced"));
const PricingSection = lazy(() => import("@/components/PricingSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const ContactFormWeb3 = lazy(() => import("@/components/ContactFormWeb3"));
const FooterWeb3 = lazy(() => import("@/components/FooterWeb3"));
const ScrollToTop = lazy(() => import("@/components/ScrollToTop"));

// Simple loading fallback
const SectionLoader = () => (
  <div className="w-full h-32 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Navigation />
      <HeroWeb3 />
      <AboutSection />
      
      <Suspense fallback={<SectionLoader />}>
        <AIAnalysisSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <ServicesWeb3 />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <TimelineProcessEnhanced />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <ClientOnboardingSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <PricingSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <FAQSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <ContactFormWeb3 />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <FooterWeb3 />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <ScrollToTop />
      </Suspense>
    </div>
  );
};

export default Index;