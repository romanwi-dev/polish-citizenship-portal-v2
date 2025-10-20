export const StaticHeritagePlaceholder = () => {
  return (
    <div 
      className="absolute inset-0 w-full h-full animate-pulse"
      style={{
        backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(0, 50%, 5%), transparent 50%), radial-gradient(circle at 80% 50%, hsl(240, 50%, 5%), transparent 50%), linear-gradient(135deg, hsl(0, 50%, 10%), hsl(240, 50%, 10%), hsl(0, 50%, 10%))'
      }}
    />
  );
};
