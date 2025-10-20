import { lazy, Suspense, useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { StaticHeritagePlaceholder } from "@/components/heroes/StaticHeritagePlaceholder";

const StaticHeritage = lazy(() => import("@/components/heroes/StaticHeritage").then(m => ({ default: m.StaticHeritage })));

// Lazy load all components for better code splitting
const Navigation = lazy(() => import("@/components/Navigation"));
const HeroWeb3 = lazy(() => import("@/components/HeroWeb3"));
const AboutSection = lazy(() => import("@/components/AboutSection"));
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
  const [show3D, setShow3D] = useState(false);
  const { ref: timelineRef, inView: timelineInView } = useInView({ threshold: 0, triggerOnce: true, rootMargin: '200px' });
  const { ref: pricingRef, inView: pricingInView } = useInView({ threshold: 0, triggerOnce: true, rootMargin: '200px' });
  const { ref: faqRef, inView: faqInView } = useInView({ threshold: 0, triggerOnce: true, rootMargin: '200px' });
  const { ref: contactRef, inView: contactInView } = useInView({ threshold: 0, triggerOnce: true, rootMargin: '200px' });

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
      <Suspense fallback={<SectionLoader />}>
        <Navigation />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <HeroWeb3 />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <AboutSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <AIAnalysisSection />
      </Suspense>
      
      <Suspense fallback={<SectionLoader />}>
        <ServicesWeb3 />
      </Suspense>
      
      <div ref={timelineRef} className="min-h-screen">
        {timelineInView ? (
          <Suspense fallback={<SectionLoader />}>
            <TimelineProcessEnhanced />
          </Suspense>
        ) : (
          <div className="h-screen" />
        )}
      </div>
      
      <Suspense fallback={<SectionLoader />}>
        <ClientOnboardingSection />
      </Suspense>
      
      <div ref={pricingRef}>
        {pricingInView ? (
          <Suspense fallback={<SectionLoader />}>
            <PricingSection />
          </Suspense>
        ) : (
          <div className="h-screen" />
        )}
      </div>
      
      <div ref={faqRef} className="min-h-[400px]">
        {faqInView ? (
          <Suspense fallback={<SectionLoader />}>
            <FAQSection />
          </Suspense>
        ) : (
          <div className="h-screen" />
        )}
      </div>
      
      <div ref={contactRef}>
        {contactInView ? (
          <Suspense fallback={<SectionLoader />}>
            <ContactFormWeb3 />
          </Suspense>
        ) : (
          <div className="h-screen" />
        )}
      </div>
      
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