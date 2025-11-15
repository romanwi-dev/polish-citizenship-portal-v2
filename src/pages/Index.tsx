import { lazy, Suspense } from "react";
import { GlobalBackground } from "@/components/GlobalBackground";
import { SEOHead } from "@/components/SEOHead";
import { StructuredData } from "@/components/StructuredData";

// Eagerly load critical above-the-fold components for LCP
import Navigation from "@/components/Navigation";
import HeroWeb3 from "@/components/HeroWeb3";
import AboutSection from "@/components/AboutSection";
import AIAnalysisSection from "@/components/AIAnalysisSection";
import SkylineDivider from "@/components/SkylineDivider";

// Import European city skyline silhouettes
import warsawSkyline from "@/assets/warsaw-skyline-overlay.png";
import pragueSkyline from "@/assets/skylines/prague.png";
import budapestSkyline from "@/assets/skylines/budapest.png";
import berlinSkyline from "@/assets/skylines/berlin.png";
import parisSkyline from "@/assets/skylines/paris.png";
import viennaSkyline from "@/assets/skylines/vienna.png";
import romeSkyline from "@/assets/skylines/rome.png";
import brusselsSkyline from "@/assets/skylines/brussels.png";
import londonSkyline from "@/assets/skylines/london.png";

// Lazy load below-the-fold components for better code splitting
const ServicesWeb3 = lazy(() => import("@/components/ServicesWeb3"));
const ClientOnboardingSection = lazy(() => import("@/components/ClientOnboardingSection"));
const TimelineProcessEnhanced = lazy(() => import("@/components/TimelineProcessEnhanced"));
const PricingSection = lazy(() => import("@/components/PricingSection"));
const TestimonialsSection = lazy(() => import("@/components/TestimonialsSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));
const ContactFormWeb3 = lazy(() => import("@/components/ContactFormWeb3"));
const LandmarkUnity = lazy(() => import("@/components/heroes/LandmarkUnity").then(m => ({ default: m.LandmarkUnity })));
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
      {/* SEO Meta Tags */}
      <SEOHead page="home" />
      <StructuredData />
      
      <div className="min-h-screen overflow-x-hidden relative">
        {/* Global Background - Adapts to theme */}
        <GlobalBackground />
        
        <div className="relative z-10">
          <Navigation />
          <HeroWeb3 />
          <AboutSection />
        
        <SkylineDivider cityName="london" alt="London skyline" />
        
        <AIAnalysisSection />
        
        <SkylineDivider cityName="warsaw" alt="Prague skyline" />
        
        <Suspense fallback={<SectionLoader />}>
          <ServicesWeb3 />
        </Suspense>
        
        <SkylineDivider cityName="budapest" alt="Budapest skyline" />
        
        <Suspense fallback={<SectionLoader />}>
          <TimelineProcessEnhanced />
        </Suspense>
        
        <SkylineDivider cityName="warsaw" alt="Berlin skyline" />
        
        <Suspense fallback={<SectionLoader />}>
          <ClientOnboardingSection />
        </Suspense>
        
        <SkylineDivider cityName="warsaw" alt="Paris skyline" />
        
        <Suspense fallback={<SectionLoader />}>
          <PricingSection />
        </Suspense>
        
        <SkylineDivider cityName="london" alt="Vienna skyline" />
        
        <Suspense fallback={<SectionLoader />}>
          <TestimonialsSection />
        </Suspense>
        
        <SkylineDivider cityName="budapest" alt="Rome skyline" />
        
        <Suspense fallback={<SectionLoader />}>
          <FAQSection />
        </Suspense>
        
        <SkylineDivider cityName="warsaw" alt="Brussels skyline" />
        
        <Suspense fallback={<SectionLoader />}>
          <ContactFormWeb3 />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <LandmarkUnity />
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