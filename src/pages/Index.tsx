import { lazy, Suspense, useState, useEffect } from "react";
import { StaticHeritagePlaceholder } from "@/components/heroes/StaticHeritagePlaceholder";

const StaticHeritage = lazy(() => import("@/components/heroes/StaticHeritage").then(m => ({ default: m.StaticHeritage })));

// Eagerly load critical above-the-fold components for LCP
import Navigation from "@/components/Navigation";
import HeroWeb3 from "@/components/HeroWeb3";
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
const CityDivider = lazy(() => import("@/components/CityDivider"));

// Simple loading fallback
const SectionLoader = () => (
  <div className="w-full h-32 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const Index = () => {
  const [show3D, setShow3D] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const isLight = document.documentElement.classList.contains("light");
      return isLight ? "light" : "dark";
    }
    return "dark";
  });

  // Watch for theme changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const root = document.documentElement;
      const newTheme = root.classList.contains("light") ? "light" : "dark";
      setTheme(newTheme);
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    // Don't load 3D in light theme
    if (theme === "light") {
      return;
    }
    
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
  }, [theme]);

  // Render all 12 sections (theme-agnostic)
  return (
    <div className="min-h-screen overflow-x-hidden relative">
      {/* Global Background - Only in dark theme */}
      {theme === "dark" && (
        <div className="fixed inset-0 z-0">
          {show3D ? (
            <Suspense fallback={<StaticHeritagePlaceholder />}>
              <StaticHeritage />
            </Suspense>
          ) : (
            <StaticHeritagePlaceholder />
          )}
        </div>
      )}
      
      <div className="relative z-10">
        <Navigation />
        <HeroWeb3 />
        
        <Suspense fallback={<SectionLoader />}>
          <CityDivider cityName="Warsaw" imagePath="/landmarks/warsaw.png" />
        </Suspense>
        
        <AboutSection />
        
        <Suspense fallback={<SectionLoader />}>
          <ServicesWeb3 />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <CityDivider cityName="Prague" imagePath="/landmarks/prague.png" />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <TimelineProcessEnhanced />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <CityDivider cityName="Budapest" imagePath="/landmarks/budapest.png" />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <ClientOnboardingSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <CityDivider cityName="Berlin" imagePath="/landmarks/berlin.png" />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <PricingSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <CityDivider cityName="Paris" imagePath="/landmarks/paris.png" />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <TestimonialsSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <CityDivider cityName="Athens" imagePath="/landmarks/athens.png" />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <FAQSection />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <CityDivider cityName="Rome" imagePath="/landmarks/rome.png" />
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