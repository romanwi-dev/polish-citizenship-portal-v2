import { lazy, Suspense, useState, useEffect } from "react";
import { StaticHeritagePlaceholder } from "@/components/heroes/StaticHeritagePlaceholder";

const StaticHeritage = lazy(() => import("@/components/heroes/StaticHeritage").then(m => ({ default: m.StaticHeritage })));

// Eagerly load critical above-the-fold components for LCP
import Navigation from "@/components/Navigation";
import HeroWeb3 from "@/components/HeroWeb3";

// Lazy load below-the-fold components for better code splitting with prefetch hints
const AboutSection = lazy(() => import(/* webpackPrefetch: true */ "@/components/AboutSection"));
const AIAnalysisSection = lazy(() => import(/* webpackPrefetch: true */ "@/components/AIAnalysisSection"));
const ServicesWeb3 = lazy(() => import(/* webpackPrefetch: true */ "@/components/ServicesWeb3"));
const ClientOnboardingSection = lazy(() => import(/* webpackPrefetch: true */ "@/components/ClientOnboardingSection"));
const TimelineProcessEnhanced = lazy(() => import(/* webpackPrefetch: true */ "@/components/TimelineProcessEnhanced"));
const PricingSection = lazy(() => import(/* webpackPrefetch: true */ "@/components/PricingSection"));
const TestimonialsSection = lazy(() => import(/* webpackPrefetch: true */ "@/components/TestimonialsSection"));
const FAQSection = lazy(() => import(/* webpackPrefetch: true */ "@/components/FAQSection"));
const ContactFormWeb3 = lazy(() => import(/* webpackPrefetch: true */ "@/components/ContactFormWeb3"));
const FooterWeb3 = lazy(() => import(/* webpackPrefetch: true */ "@/components/FooterWeb3"));
const ScrollToTop = lazy(() => import(/* webpackPrefetch: true */ "@/components/ScrollToTop"));

// Simple loading fallback
const SectionLoader = () => (
  <div className="w-full h-32 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Index = () => {
  const [show3D, setShow3D] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const handleInteraction = () => {
      setShow3D(true);
      cleanup();
    };
    
    const cleanup = () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
    };
    
    // Listen for user interaction
    window.addEventListener('scroll', handleInteraction, { once: true });
    window.addEventListener('click', handleInteraction, { once: true });
    
    // Fallback: load after 2 seconds anyway
    timer = setTimeout(() => {
      setShow3D(true);
      cleanup();
    }, 2000);
    
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      {/* Global Background - Lazy loaded 3D */}
      <div className="fixed inset-0 z-0">
        {show3D ? (
          <Suspense fallback={<StaticHeritagePlaceholder />}>
            <StaticHeritage />
          </Suspense>
        ) : (
          <StaticHeritagePlaceholder />
        )}
      </div>
      
      <div className="relative z-10">
      <Navigation />
      <HeroWeb3 />
      
      <Suspense fallback={<SectionLoader />}>
        <AboutSection />
      </Suspense>
      
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
  );
};

export default Index;