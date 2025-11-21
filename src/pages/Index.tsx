import { lazy, Suspense } from "react";
import { GlobalBackground } from "@/components/GlobalBackground";
import { SkipToContent } from "@/components/ui/skip-to-content";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";

// Eagerly load critical above-the-fold components for LCP
import Navigation from "@/components/Navigation";
import { HeroWavingFlags } from "@/components/heroes/premium/HeroWavingFlags";
import { WarsawSkyline } from "@/components/WarsawSkyline";
import { BudapestSkyline } from "@/components/BudapestSkyline";
import { BerlinSkyline } from "@/components/BerlinSkyline";

import AboutSection from "@/components/AboutSection";
import AIAnalysisSection from "@/components/AIAnalysisSection";

// Lazy load below-the-fold components for better code splitting
const ServicesWeb3 = lazy(() => import("@/components/ServicesWeb3"));
const ClientOnboardingSection = lazy(() => import("@/components/ClientOnboardingSection"));
const TimelineProcessEnhanced = lazy(() => import("@/components/TimelineProcessEnhanced"));
const PricingSection = lazy(() => import("@/components/PricingSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
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
        
        <div className="relative z-10">
          <Navigation />
          
          {/* Main content wrapper with semantic HTML and ARIA */}
          <main id="main-content" role="main" aria-label="Main content">
          <HeroWavingFlags />
          <div className="my-16 md:my-24">
            <WarsawSkyline />
          </div>
          <AboutSection />
        
        <Suspense fallback={<SectionLoader />}>
          <ServicesWeb3 />
        </Suspense>
        
        <div className="my-16 md:my-24">
          <BudapestSkyline />
        </div>
        
        <Suspense fallback={<SectionLoader />}>
          <TimelineProcessEnhanced />
        </Suspense>
        
        <div className="my-16 md:my-24">
          <BerlinSkyline />
        </div>
        
        <Suspense fallback={<SectionLoader />}>
          <ClientOnboardingSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <PricingSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <TestimonialsSection />
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
          </main>
        </div>
      </div>
    </>
  );
};

export default Index;