import { lazy, Suspense, useState, useEffect } from "react";
import { StaticHeritagePlaceholder } from "@/components/heroes/StaticHeritagePlaceholder";

const StaticHeritage = lazy(() => import("@/components/heroes/StaticHeritage").then(m => ({ default: m.StaticHeritage })));

export const GlobalBackground = () => {
  const [show3D, setShow3D] = useState(true); // Show immediately
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
