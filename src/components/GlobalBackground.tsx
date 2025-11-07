import { lazy, Suspense, useState, useEffect } from "react";
import { StaticHeritagePlaceholder } from "@/components/heroes/StaticHeritagePlaceholder";

const StaticHeritage = lazy(() => import("@/components/heroes/StaticHeritage").then(m => ({ default: m.StaticHeritage })));

export const GlobalBackground = () => {
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

  // Delay 3D background loading to improve initial page load
  useEffect(() => {
    let timer: NodeJS.Timeout;
    const cleanup = () => {
      if (timer) clearTimeout(timer);
    };
    
    timer = setTimeout(() => {
      setShow3D(true);
      cleanup();
    }, 2000);
    
    return cleanup;
  }, [theme]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {theme === "dark" && (
        <>
          {show3D ? (
            <Suspense fallback={<StaticHeritagePlaceholder />}>
              <StaticHeritage />
            </Suspense>
          ) : (
            <StaticHeritagePlaceholder />
          )}
        </>
      )}
    </div>
  );
};
