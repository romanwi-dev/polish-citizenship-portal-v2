// PERF-MICRO-V2: Optimized background with efficient observer
import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { StaticHeritagePlaceholder } from "@/components/heroes/StaticHeritagePlaceholder";
import { StaticHeritageLightTheme } from "@/components/heroes/StaticHeritageLightTheme";

const StaticHeritage = lazy(() => import("@/components/heroes/StaticHeritage").then(m => ({ default: m.StaticHeritage })));

export const GlobalBackground = () => {
  const [show3D, setShow3D] = useState(false);
  const [isDark, setIsDark] = useState(true);
  // PERF-MICRO-V2: Use ref to prevent observer recreation
  const observerRef = useRef<MutationObserver | null>(null);

  useEffect(() => {
    // PERF-MICRO-V2: Early return if not in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    // Check if dark or light mode - optimized with debounce
    let timeoutId: NodeJS.Timeout;
    const checkTheme = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsDark(document.documentElement.classList.contains('dark'));
      }, 50); // Debounce rapid theme changes
    };
    
    checkTheme();
    
    // PERF-MICRO-V2: Reuse observer if it exists
    if (!observerRef.current) {
      observerRef.current = new MutationObserver(checkTheme);
    }
    
    observerRef.current.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => {
      clearTimeout(timeoutId);
      // PERF-MICRO-V2: Disconnect but keep observer ref for reuse
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  // PERF-MICRO-V2: Delay 3D background loading for dark themes only
  useEffect(() => {
    if (isDark) {
      const timer = setTimeout(() => {
        setShow3D(true);
      }, 2000);
      return () => clearTimeout(timer);
    } else {
      setShow3D(false); // No 3D in light mode
    }
  }, [isDark]);

  // PERF-MICRO-V2: Early return for light mode - skip unnecessary renders
  // DARK themes: Show 3D heritage with loading
  // LIGHT themes: Show beautiful light background immediately
  if (!isDark) {
    return (
      <div className="fixed inset-0 z-0">
        <StaticHeritageLightTheme />
      </div>
    );
  }

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
