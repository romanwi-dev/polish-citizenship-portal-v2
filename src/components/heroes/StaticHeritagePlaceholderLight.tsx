export const StaticHeritagePlaceholderLight = () => {
  // Same as the light theme background for consistency
  const backgroundImage = `
    radial-gradient(circle at 20% 30%, hsl(var(--primary) / 0.08), transparent 50%),
    radial-gradient(circle at 80% 70%, hsl(var(--primary) / 0.06), transparent 50%),
    linear-gradient(135deg, 
      hsl(var(--background)), 
      hsl(var(--muted) / 0.3), 
      hsl(var(--background))
    )
  `;

  return (
    <div className="absolute inset-0 w-full h-full">
      <div 
        className="absolute inset-0 animate-light-wave bg-[length:200%_200%]"
        style={{ backgroundImage }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/60" />
      
      <style>{`
        @keyframes light-wave {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-light-wave {
          animation: light-wave 20s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
