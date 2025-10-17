export const StaticHeritage = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <div 
        className="absolute inset-0 animate-color-wave bg-[length:200%_200%]"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #1a0a0a, transparent 50%), radial-gradient(circle at 80% 50%, #0a0a1a, transparent 50%), linear-gradient(135deg, #2d0a0a, #0a0a2d, #2d0a0a)'
        }}
      />
      <div className="absolute inset-0 opacity-40 blur-sm pointer-events-none" />
      
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
          animation: color-wave 12s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
