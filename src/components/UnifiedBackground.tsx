import { lazy, Suspense, useState, useEffect, memo } from "react";
import { StaticHeritagePlaceholder } from "@/components/heroes/StaticHeritagePlaceholder";
import { StaticHeritageLightTheme } from "@/components/heroes/StaticHeritageLightTheme";

const HeritageTapestry = lazy(() => import("@/components/heroes/HeritageTapestry").then(m => ({ default: m.HeritageTapestry })));

export const UnifiedBackground = memo(() => {
  const [show3D, setShow3D] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    
    // Watch for theme changes with proper cleanup
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    // Cleanup observer on unmount
    return () => observer.disconnect();
  }, []);

  // Delay 3D background loading for dark themes only
  useEffect(() => {
    if (isDark) {
      const timer = setTimeout(() => {
        setShow3D(true);
      }, 2000); // 2s delay
      return () => clearTimeout(timer);
    } else {
      setShow3D(false);
    }
  }, [isDark]);

  // LIGHT theme: Show immediate light background
  if (!isDark) {
    return (
      <div className="fixed inset-0 z-0">
        <StaticHeritageLightTheme />
      </div>
    );
  }

  // DARK theme: Show 3D heritage background with loading state
  return (
    <div className="fixed inset-0 z-0">
      {show3D ? (
        <Suspense fallback={<StaticHeritagePlaceholder />}>
          <HeritageTapestry />
        </Suspense>
      ) : (
        <StaticHeritagePlaceholder />
      )}
    </div>
  );
});

UnifiedBackground.displayName = 'UnifiedBackground';
