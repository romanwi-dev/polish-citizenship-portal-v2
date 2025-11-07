export const StaticHeritagePlaceholder = () => {
  return (
    <div 
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(220, 20, 60, 0.3), transparent 45%),
          radial-gradient(circle at 80% 70%, rgba(139, 0, 255, 0.3), transparent 45%),
          linear-gradient(135deg, 
            hsl(0, 50%, 10%) 0%, 
            hsl(240, 50%, 12%) 50%, 
            hsl(0, 50%, 10%) 100%
          )
        `
      }}
    />
  );
};
