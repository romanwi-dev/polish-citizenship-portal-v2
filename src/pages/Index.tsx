import { lazy, Suspense, useEffect } from "react";
import { GlobalBackground } from "@/components/GlobalBackground";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";
import { PerformanceMonitor } from "@/components/performance/PerformanceMonitor";

// Eagerly load critical above-the-fold components for LCP
import Navigation from "@/components/Navigation";
import { HeroWavingFlags } from "@/components/heroes/premium/HeroWavingFlags";
import AboutSection from "@/components/AboutSection";
import AIAnalysisSection from "@/components/AIAnalysisSection";

// SkylineDivider removed - no images

// Skyline images removed - using pure design system now

// Lazy load below-the-fold components for better code splitting
const ServicesWeb3 = lazy(() => import("@/components/ServicesWeb3"));
const ClientOnboardingSection = lazy(() => import("@/components/ClientOnboardingSection"));
const TimelineProcessEnhanced = lazy(() => import("@/components/TimelineProcessEnhanced"));
const PricingSection = lazy(() => import("@/components/PricingSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const ContactFormWeb3 = lazy(() => import("@/components/ContactFormWeb3"));
// Preload LandmarkUnity only when user scrolls near it
const LandmarkUnity = lazy(() => 
  import("@/components/heroes/LandmarkUnity").then(m => ({ default: m.LandmarkUnity }))
);
const FooterWeb3 = lazy(() => import("@/components/FooterWeb3"));
const ScrollToTop = lazy(() => import("@/components/ScrollToTop"));

// Simple loading fallback
const SectionLoader = () => (
  <div className="w-full h-32 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Index = () => {
  useEffect(() => {
    // Enable performance monitor in development
    if (import.meta.env.DEV) {
      localStorage.setItem('showPerformanceMonitor', 'true');
    }
  }, []);

  return (
    <>
      {/* SEO Meta Tags */}
      <SEOHead page="home" />
      <StructuredData />
      <PerformanceMonitor />
      
      {/* No image preloading needed - using design system only */}
      
      <div className="min-h-screen overflow-x-hidden relative">
        {/* Global Background - Adapts to theme */}
        <GlobalBackground />
        
        <div className="relative z-10">
          <Navigation />
          <HeroWavingFlags />
          <AboutSection />
        
        <AIAnalysisSection />
        
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
        </div>
      </div>
    </>
  );
};

export default Index;