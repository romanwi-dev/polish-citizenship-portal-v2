import { useEffect, useState } from "react";

interface CityDividerProps {
  cityName: string;
  imagePath: string;
}

const CityDivider = ({ cityName, imagePath }: CityDividerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    setIsVisible(true);
    
    // Detect theme
    const updateTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setTheme(isDark ? 'dark' : 'light');
    };
    
    updateTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full flex items-center justify-center overflow-hidden -my-8">
      <div
        className={`transition-all duration-1000 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <img
          src={imagePath}
          alt={`${cityName} landmark`}
          className="w-full max-w-[900px] h-auto object-contain transition-opacity duration-500"
          loading="lazy"
          style={{
            opacity: theme === 'dark' ? '0.20' : '0.18',
            mixBlendMode: theme === 'dark' ? 'screen' : 'multiply',
            filter: theme === 'light' ? 'invert(1)' : 'none'
          }}
        />
      </div>
    </div>
  );
};

export default CityDivider;
