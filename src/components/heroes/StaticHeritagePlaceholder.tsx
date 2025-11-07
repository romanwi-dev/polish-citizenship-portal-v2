export const StaticHeritagePlaceholder = () => {
  return (
    <div 
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{
        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(139, 0, 0, 0.12), transparent 40%),
          radial-gradient(circle at 80% 70%, rgba(75, 0, 130, 0.12), transparent 40%),
          linear-gradient(135deg, 
            hsl(0, 40%, 8%) 0%, 
            hsl(240, 40%, 10%) 50%, 
            hsl(0, 40%, 8%) 100%
          )
        `
      }}
    />
  );
};
