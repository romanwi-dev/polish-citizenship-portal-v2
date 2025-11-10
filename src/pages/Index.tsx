import { lazy, Suspense, useState, useEffect } from "react";
import { StaticHeritagePlaceholder } from "@/components/heroes/StaticHeritagePlaceholder";

const StaticHeritage = lazy(() => import("@/components/heroes/StaticHeritage").then(m => ({ default: m.StaticHeritage })));

// Eagerly load critical above-the-fold components for LCP
import Navigation from "@/components/Navigation";
import HeroWeb3 from "@/components/HeroWeb3";
import AboutSection from "@/components/AboutSection";
import AIAnalysisSection from "@/components/AIAnalysisSection";
import SkylineDivider from "@/components/SkylineDivider";

// Import European city skyline silhouettes
import warsawSkyline from "@/assets/skylines/warsaw.png";
import pragueSkyline from "@/assets/skylines/prague.png";
import budapestSkyline from "@/assets/skylines/budapest.png";
import berlinSkyline from "@/assets/skylines/berlin.png";
import parisSkyline from "@/assets/skylines/paris.png";
import viennaSkyline from "@/assets/skylines/vienna.png";
import romeSkyline from "@/assets/skylines/rome.png";
import brusselsSkyline from "@/assets/skylines/brussels.png";

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

  // Render all 12 sections with permanent dark background
  return (
    <div className="min-h-screen overflow-x-hidden relative">
      {/* Global Background - Permanent Dark Mode */}
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
        <AboutSection />
        
        <SkylineDivider imageSrc={warsawSkyline} alt="Warsaw skyline" />
        
        <AIAnalysisSection />
        
        <SkylineDivider imageSrc={pragueSkyline} alt="Prague skyline" />
        
        <Suspense fallback={<SectionLoader />}>
          <ServicesWeb3 />
        </Suspense>
        
        <SkylineDivider imageSrc={budapestSkyline} alt="Budapest skyline" />
        
        <Suspense fallback={<SectionLoader />}>
          <TimelineProcessEnhanced />
        </Suspense>
        
        <SkylineDivider imageSrc={berlinSkyline} alt="Berlin skyline" />
        
        <Suspense fallback={<SectionLoader />}>
          <ClientOnboardingSection />
        </Suspense>
        
        <SkylineDivider imageSrc={parisSkyline} alt="Paris skyline" />
        
        <Suspense fallback={<SectionLoader />}>
          <PricingSection />
        </Suspense>
        
        <SkylineDivider imageSrc={viennaSkyline} alt="Vienna skyline" />
        
        <Suspense fallback={<SectionLoader />}>
          <TestimonialsSection />
        </Suspense>
        
        <SkylineDivider imageSrc={romeSkyline} alt="Rome skyline" />
        
        <Suspense fallback={<SectionLoader />}>
          <FAQSection />
        </Suspense>
        
        <SkylineDivider imageSrc={brusselsSkyline} alt="Brussels skyline" />
        
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