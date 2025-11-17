import { memo } from "react";

/**
 * Mobile-optimized CSS-only background
 * No Canvas, no WebGL - pure CSS gradients for maximum performance
 */
export const StaticHeritageMobile = memo(() => {
  // Same color scheme as dark 3D version but CSS-only
  const backgroundImage = 'radial-gradient(circle at 20% 50%, hsl(0, 50%, 5%), transparent 50%), radial-gradient(circle at 80% 50%, hsl(240, 50%, 5%), transparent 50%), linear-gradient(135deg, hsl(0, 50%, 10%), hsl(240, 50%, 10%), hsl(0, 50%, 10%))';

  return (
    <div className="absolute inset-0 w-full h-full">
      <div 
        className="absolute inset-0 animate-color-wave-slow bg-[length:200%_200%]"
        style={{ backgroundImage }}
      />
      <div className="absolute inset-0 opacity-40 blur-sm pointer-events-none" />
      
      <style>{`
        @keyframes color-wave-slow {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-color-wave-slow {
          animation: color-wave-slow 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
});

StaticHeritageMobile.displayName = 'StaticHeritageMobile';
