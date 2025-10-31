import { lazy, Suspense, useState, useEffect } from "react";
import { StaticHeritagePlaceholder } from "@/components/heroes/StaticHeritagePlaceholder";

const StaticHeritage = lazy(() => import("@/components/heroes/StaticHeritage").then(m => ({ default: m.StaticHeritage })));

// Eagerly load critical above-the-fold components for LCP
import Navigation from "@/components/Navigation";
import HeroWeb3 from "@/components/HeroWeb3";

// Premium Light Theme Components
const LightThemeHero = lazy(() => import("@/components/demo/LightThemeHero"));
const LightThemeAbout = lazy(() => import("@/components/demo/LightThemeAbout"));
const LightThemeContact = lazy(() => import("@/components/demo/LightThemeContact"));

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
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Check theme
    const savedTheme = localStorage.getItem("theme") || "dark";
    setTheme(savedTheme as "light" | "dark");
    
    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const root = document.documentElement;
      const currentTheme = root.classList.contains("light") ? "light" : "dark";
      setTheme(currentTheme);
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    
    return () => observer.disconnect();
  }, []);

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

  // Premium Light Theme
  if (theme === "light") {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <Suspense fallback={<SectionLoader />}>
          <LightThemeHero />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <LightThemeAbout />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <LightThemeContact />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <FooterWeb3 />
        </Suspense>
        <Suspense fallback={<SectionLoader />}>
          <ScrollToTop />
        </Suspense>
      </div>
    );
  }

  // Dark Theme (Default)
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