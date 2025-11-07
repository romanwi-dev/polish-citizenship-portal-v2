import { memo } from "react";

export const StaticHeritage = memo(() => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      {/* Primary animated gradient layer */}
      <div 
        className="absolute inset-0 animate-color-wave bg-[length:200%_200%]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(220, 20, 60, 0.55), transparent 45%),
            radial-gradient(circle at 80% 70%, rgba(139, 0, 255, 0.55), transparent 45%),
            radial-gradient(circle at 50% 50%, rgba(220, 20, 60, 0.35), transparent 65%),
            linear-gradient(135deg, 
              hsl(0, 50%, 5%) 0%, 
              hsl(240, 50%, 6%) 25%, 
              hsl(0, 45%, 5%) 50%, 
              hsl(240, 45%, 6%) 75%, 
              hsl(0, 50%, 5%) 100%
            )
          `
        }}
      />
      
      {/* Secondary gradient layer for depth */}
      <div 
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: `
            radial-gradient(circle at 60% 40%, rgba(220, 20, 60, 0.45), transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(138, 43, 226, 0.45), transparent 50%),
            radial-gradient(ellipse at 50% 100%, rgba(139, 0, 0, 0.4), transparent 60%)
          `
        }}
      />
      
      <style>{`
        @keyframes color-wave {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-color-wave {
          animation: color-wave 14s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
});

StaticHeritage.displayName = 'StaticHeritage';
