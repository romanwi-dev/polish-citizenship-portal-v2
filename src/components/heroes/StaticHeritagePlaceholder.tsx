export const StaticHeritagePlaceholder = () => {
  return (
    <>
      <div 
        className="absolute inset-0 w-full h-full animate-slow-wave"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.15), transparent 50%), radial-gradient(circle at 80% 50%, hsl(var(--secondary) / 0.12), transparent 50%), linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--background)), hsl(var(--primary) / 0.08))'
        }}
      />
      
      <style>{`
        @keyframes slow-wave {
          0%, 100% { opacity: 0.95; }
          50% { opacity: 1; }
        }
        
        .animate-slow-wave {
          animation: slow-wave 15s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};
