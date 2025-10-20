import { lazy, Suspense, useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { StaticHeritagePlaceholder } from "@/components/heroes/StaticHeritagePlaceholder";

const StaticHeritage = lazy(() => import("@/components/heroes/StaticHeritage").then(m => ({ default: m.StaticHeritage })));

// Eagerly load critical above-the-fold components for LCP
import Navigation from "@/components/Navigation";
import HeroWeb3 from "@/components/HeroWeb3";

// Lazy load below-the-fold components for better code splitting
const AboutSection = lazy(() => import("@/components/AboutSection"));
const AIAnalysisSection = lazy(() => import("@/components/AIAnalysisSection"));
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
  const [show3D, setShow3D] = useState(false);
  const { ref: timelineRef, inView: timelineInView } = useInView({ threshold: 0, triggerOnce: true, rootMargin: '200px' });
  const { ref: pricingRef, inView: pricingInView } = useInView({ threshold: 0, triggerOnce: true, rootMargin: '200px' });
  const { ref: testimonialsRef, inView: testimonialsInView } = useInView({ threshold: 0, triggerOnce: true, rootMargin: '200px' });
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
      
      <div ref={timelineRef} style={{ minHeight: '350rem' }}>
        {timelineInView ? (
          <Suspense fallback={<SectionLoader />}>
            <TimelineProcessEnhanced />
          </Suspense>
        ) : (
          <div style={{ height: '350rem' }} />
        )}
      </div>
      
      <Suspense fallback={<SectionLoader />}>
        <ClientOnboardingSection />
      </Suspense>
      
      <div ref={pricingRef} style={{ minHeight: '50rem' }}>
        {pricingInView ? (
          <Suspense fallback={<SectionLoader />}>
            <PricingSection />
          </Suspense>
        ) : (
          <div style={{ height: '50rem' }} />
        )}
      </div>
      
      <div ref={testimonialsRef} style={{ minHeight: '40rem' }}>
        {testimonialsInView ? (
          <Suspense fallback={<SectionLoader />}>
            <TestimonialsSection />
          </Suspense>
        ) : (
          <div style={{ height: '40rem' }} />
        )}
      </div>
      
      <div ref={faqRef} style={{ minHeight: '40rem' }}>
        {faqInView ? (
          <Suspense fallback={<SectionLoader />}>
            <FAQSection />
          </Suspense>
        ) : (
          <div style={{ height: '40rem' }} />
        )}
      </div>
      
      <div ref={contactRef} style={{ minHeight: '50rem' }}>
        {contactInView ? (
          <Suspense fallback={<SectionLoader />}>
            <ContactFormWeb3 />
          </Suspense>
        ) : (
          <div style={{ height: '50rem' }} />
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