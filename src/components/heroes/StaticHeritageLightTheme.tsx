import { memo } from "react";

export const StaticHeritageLightTheme = memo(() => {
  // Soft, elegant light gradient - subtle movement, perfect contrast
  const backgroundImage = `
    radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.06), transparent 40%),
    radial-gradient(circle at 80% 70%, hsl(var(--secondary) / 0.05), transparent 40%),
    radial-gradient(circle at 50% 50%, hsl(var(--muted) / 0.3), transparent 60%),
    linear-gradient(135deg, 
      hsl(var(--background)), 
      hsl(var(--muted) / 0.15), 
      hsl(var(--background))
    )
  `;

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* Main animated gradient background */}
      <div 
        className="absolute inset-0 animate-light-wave bg-[length:200%_200%]"
        style={{ backgroundImage }}
      />
      
      {/* Soft depth overlay - creates visual hierarchy */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/50" />
      
      {/* Gentle shine effect - adds premium feel */}
      <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-transparent via-primary/4 to-transparent animate-shine" />
      
      <style>{`
        @keyframes light-wave {
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
        
        .animate-light-wave {
          animation: light-wave 25s ease-in-out infinite;
        }
        
        .animate-shine {
          animation: shine 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
});

StaticHeritageLightTheme.displayName = 'StaticHeritageLightTheme';
