import { useState, useEffect } from "react";
import warsawSkyline from "@/assets/warsaw-skyline-white.png";

interface SkylineDividerProps {
  imageSrc?: string;
  alt?: string;
}

const SkylineDivider = ({ imageSrc = warsawSkyline, alt = "Warsaw skyline" }: SkylineDividerProps) => {
  const [isDark, setIsDark] = useState(true);
  const [themeColor, setThemeColor] = useState<'red' | 'blue'>('red');

  useEffect(() => {
    const checkTheme = () => {
      const htmlElement = document.documentElement;
      setIsDark(htmlElement.classList.contains('dark'));
      
      // Detect theme color variant
      if (htmlElement.classList.contains('theme-blue')) {
        setThemeColor('blue');
      } else {
        setThemeColor('red');
      }
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, []);

  // Light theme background (matching StaticHeritageLightTheme)
  const lightBackgroundImage = `
    radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.06), transparent 40%),
    radial-gradient(circle at 80% 70%, hsl(var(--secondary) / 0.05), transparent 40%),
    radial-gradient(circle at 50% 50%, hsl(var(--muted) / 0.3), transparent 60%),
    linear-gradient(135deg, 
      hsl(var(--background)), 
      hsl(var(--muted) / 0.15), 
      hsl(var(--background))
    )
  `;

  // Dark theme background
  const darkBackgroundImage = 'radial-gradient(circle at 20% 50%, hsl(0, 50%, 5%), transparent 50%), radial-gradient(circle at 80% 50%, hsl(240, 50%, 5%), transparent 50%), linear-gradient(135deg, hsl(0, 50%, 10%), hsl(240, 50%, 10%), hsl(0, 50%, 10%))';

  // Skyline filter for light themes
  const getSkylineFilter = () => {
    if (isDark) {
      return 'brightness(0.7)';
    }
    // Light theme: colorize based on theme variant
    if (themeColor === 'blue') {
      return 'brightness(0.8) sepia(0.6) saturate(2) hue-rotate(200deg) contrast(1.1)';
    }
    return 'brightness(0.75) sepia(0.6) saturate(2) hue-rotate(340deg) contrast(1.1)';
  };

  return (
    <div className="relative w-full my-8 md:my-12 overflow-hidden h-[200px] md:h-[400px]">
      {/* Theme-aware background */}
      <div 
        className="absolute inset-0 animate-divider-wave bg-[length:200%_200%]"
        style={{
          backgroundImage: isDark ? darkBackgroundImage : lightBackgroundImage
        }}
      />
      
      {/* Full-width skyline silhouette */}
      <div className="absolute inset-0">
        <img 
          src={imageSrc} 
          alt={alt} 
          className="w-full h-full object-cover"
          style={{
            filter: getSkylineFilter(),
            opacity: isDark ? 0.6 : 0.7
          }}
        />
      </div>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/10" />
      
      {/* Soft shine effect for light themes only */}
      {!isDark && (
        <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-transparent via-primary/4 to-transparent animate-shine" />
      )}
      
      <style>{`
        @keyframes divider-wave {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        @keyframes shine {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(30deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(30deg);
          }
        }
        
        .animate-divider-wave {
          animation: divider-wave 25s ease-in-out infinite;
        }
        
        .animate-shine {
          animation: shine 20s ease-in-out infinite;
        }
        
        /* Reduced motion for accessibility and mobile battery saving */
        @media (prefers-reduced-motion: reduce) {
          .animate-divider-wave,
          .animate-shine {
            animation: none;
          }
        }
        
        @media (max-width: 768px) {
          .animate-divider-wave {
            animation-duration: 40s;
          }
          .animate-shine {
            animation-duration: 35s;
          }
        }
      `}</style>
    </div>
  );
};

export default SkylineDivider;
