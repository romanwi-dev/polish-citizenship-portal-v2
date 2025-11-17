import { lazy, Suspense, useState, useEffect } from "react";
import { StaticHeritagePlaceholder } from "@/components/heroes/StaticHeritagePlaceholder";
import { StaticHeritageLightTheme } from "@/components/heroes/StaticHeritageLightTheme";
import { StaticHeritageMobile } from "@/components/heroes/StaticHeritageMobile";
import { SimplifiedHeritage3D } from "@/components/heroes/SimplifiedHeritage3D";
import { useDeviceTier } from "@/hooks/useDeviceTier";

const StaticHeritage = lazy(() => import("@/components/heroes/StaticHeritage").then(m => ({ default: m.StaticHeritage })));

export const GlobalBackground = () => {
  const deviceTier = useDeviceTier();
  const [show3D, setShow3D] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    // Check if dark or light mode
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  // Delay 3D background loading for high-power devices only
  useEffect(() => {
    if (isDark && deviceTier === 'high-power') {
      const timer = setTimeout(() => {
        setShow3D(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShow3D(false);
    }
  }, [isDark, deviceTier]);

  // LIGHT theme: Beautiful light background
  if (!isDark) {
    return (
      <div className="fixed inset-0 z-0">
        <StaticHeritageLightTheme />
      </div>
    );
  }

  // MOBILE: CSS-only background for performance
  if (deviceTier === 'mobile') {
    return (
      <div className="fixed inset-0 z-0">
        <StaticHeritageMobile />
      </div>
    );
  }

  // LOW-POWER (tablets): Simplified 3D
  if (deviceTier === 'low-power') {
    return (
      <div className="fixed inset-0 z-0">
        <SimplifiedHeritage3D />
      </div>
    );
  }

  // HIGH-POWER (desktop): Full 3D experience
  return (
    <div className="fixed inset-0 z-0">
      {show3D ? (
        <Suspense fallback={<StaticHeritagePlaceholder />}>
          <StaticHeritage />
        </Suspense>
      ) : (
        <StaticHeritagePlaceholder />
      )}
    </div>
  );
};
