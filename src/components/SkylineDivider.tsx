import { useState, useEffect } from "react";
import warsawSkylineWhite from "@/assets/warsaw-skyline-white.png";
import warsawSkylineBlue from "@/assets/warsaw-skyline-blue.png";
import warsawSkylineRed from "@/assets/warsaw-skyline-red.png";
import londonSkylineBlue from "@/assets/london-skyline-blue.png";
import londonSkylineRed from "@/assets/london-skyline-red.png";
import berlinSkylineWhite from "@/assets/berlin-skyline-white.png";
import berlinSkylineBlue from "@/assets/berlin-skyline-blue.png";
import berlinSkylineRed from "@/assets/berlin-skyline-red.png";
import parisSkylineWhite from "@/assets/paris-skyline-white.png";
import parisSkylineBlue from "@/assets/paris-skyline-blue.png";
import parisSkylineRed from "@/assets/paris-skyline-red.png";
import viennaSkylineWhite from "@/assets/vienna-skyline-white.png";
import viennaSkylineBlue from "@/assets/vienna-skyline-blue.png";
import viennaSkylineRed from "@/assets/vienna-skyline-red.png";
import romeSkylineWhite from "@/assets/rome-skyline-white.png";
import romeSkylineBlue from "@/assets/rome-skyline-blue.png";
import romeSkylineRed from "@/assets/rome-skyline-red.png";
import brusselsSkylineWhite from "@/assets/brussels-skyline-white.png";
import brusselsSkylineBlue from "@/assets/brussels-skyline-blue.png";
import brusselsSkylineRed from "@/assets/brussels-skyline-red.png";
import athensSkylineWhite from "@/assets/athens-skyline-white.png";
import athensSkylineBlue from "@/assets/athens-skyline-blue.png";
import athensSkylineRed from "@/assets/athens-skyline-red.png";

interface SkylineDividerProps {
  imageSrc?: string;
  alt?: string;
  cityName?: 'warsaw' | 'london' | 'berlin' | 'paris' | 'vienna' | 'rome' | 'brussels' | 'athens';
}

const SkylineDivider = ({ imageSrc, alt = "City skyline", cityName = 'warsaw' }: SkylineDividerProps) => {
  const [isDark, setIsDark] = useState(true);
  const [themeColor, setThemeColor] = useState<'red' | 'blue'>('red');

  useEffect(() => {
    const checkTheme = () => {
      const htmlElement = document.documentElement;
      const newIsDark = htmlElement.classList.contains('dark');
      const newThemeColor = htmlElement.classList.contains('theme-blue') ? 'blue' : 'red';
      
      setIsDark(newIsDark);
      setThemeColor(newThemeColor);
      
      console.log('🎨 SkylineDivider theme update:', { 
        isDark: newIsDark, 
        themeColor: newThemeColor,
        cityName,
        willUseImage: newIsDark ? 'white' : newThemeColor
      });
    };
    
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { 
      attributes: true, 
      attributeFilter: ['class'] 
    });
    
    return () => observer.disconnect();
  }, [cityName]);

  // Select the correct colored skyline based on theme mode AND color
  const getSkylineImage = () => {
    if (imageSrc) return imageSrc; // Allow manual override
    
    if (isDark) {
      // Dark mode: use white skylines for all cities
      const darkSkylineMap = {
        warsaw: warsawSkylineWhite,
        london: warsawSkylineWhite,
        berlin: berlinSkylineWhite,
        paris: parisSkylineWhite,
        vienna: viennaSkylineWhite,
        rome: romeSkylineWhite,
        brussels: brusselsSkylineWhite,
        athens: athensSkylineWhite
      };
      return darkSkylineMap[cityName];
    }
    
    // Light mode: use theme-colored skylines (blue or red)
    const lightSkylineMap = {
      warsaw: themeColor === 'blue' ? warsawSkylineBlue : warsawSkylineRed,
      london: themeColor === 'blue' ? londonSkylineBlue : londonSkylineRed,
      berlin: themeColor === 'blue' ? berlinSkylineBlue : berlinSkylineRed,
      paris: themeColor === 'blue' ? parisSkylineBlue : parisSkylineRed,
      vienna: themeColor === 'blue' ? viennaSkylineBlue : viennaSkylineRed,
      rome: themeColor === 'blue' ? romeSkylineBlue : romeSkylineRed,
      brussels: themeColor === 'blue' ? brusselsSkylineBlue : brusselsSkylineRed,
      athens: themeColor === 'blue' ? athensSkylineBlue : athensSkylineRed
    };
    
    return lightSkylineMap[cityName];
  };

  // Enhanced light theme background for better contrast
  const lightBackgroundImage = `
    radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.14), transparent 50%),
    radial-gradient(circle at 80% 70%, hsl(var(--secondary) / 0.12), transparent 50%),
    radial-gradient(circle at 50% 50%, hsl(var(--muted) / 0.45), transparent 70%),
    linear-gradient(135deg, 
      hsl(var(--background)), 
      hsl(var(--muted) / 0.3), 
      hsl(var(--background))
    )
  `;

  // Dark theme background
  const darkBackgroundImage = 'radial-gradient(circle at 20% 50%, hsl(0, 50%, 5%), transparent 50%), radial-gradient(circle at 80% 50%, hsl(240, 50%, 5%), transparent 50%), linear-gradient(135deg, hsl(0, 50%, 10%), hsl(240, 50%, 10%), hsl(0, 50%, 10%))';

  // Simplified filters - colored images don't need heavy filtering
  const getSkylineFilter = () => {
    if (isDark) {
      return 'brightness(0.85)'; // Slightly dim white for dark mode
    }
    // Light mode: no filter needed for colored images
    return 'none';
  };

  const getSkylineOpacity = () => {
    // Consistent opacity for both modes
    return isDark ? 0.7 : 0.8;
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
      
      {/* Full-width skyline silhouette - theme-aware images */}
      <div className="absolute inset-0">
        <img 
          src={getSkylineImage()} 
          alt={alt} 
          width="1920"
          height="640"
          className="w-full h-full object-cover transition-opacity duration-500"
          loading="lazy"
          decoding="async"
          style={{
            filter: getSkylineFilter(),
            opacity: getSkylineOpacity(),
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
