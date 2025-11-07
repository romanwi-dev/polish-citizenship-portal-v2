import { memo } from "react";

export const StaticHeritage = memo(() => {
  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 animate-color-wave bg-[length:200%_200%]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(139, 0, 0, 0.15), transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(75, 0, 130, 0.15), transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(139, 0, 0, 0.08), transparent 60%),
            linear-gradient(135deg, 
              hsl(0, 40%, 8%) 0%, 
              hsl(240, 40%, 10%) 25%, 
              hsl(0, 35%, 9%) 50%, 
              hsl(240, 35%, 11%) 75%, 
              hsl(0, 40%, 8%) 100%
            )
          `
        }}
      />
      
      {/* Subtle overlay for depth */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `
            radial-gradient(circle at 60% 40%, rgba(220, 20, 60, 0.1), transparent 50%),
            radial-gradient(circle at 40% 80%, rgba(138, 43, 226, 0.1), transparent 50%)
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
          animation: color-wave 15s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
});

StaticHeritage.displayName = 'StaticHeritage';
