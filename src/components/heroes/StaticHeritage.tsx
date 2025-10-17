export const StaticHeritage = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <div 
        className="absolute inset-0 animate-color-wave bg-[length:200%_200%]"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #0f0000, transparent 50%), radial-gradient(circle at 60% 50%, #1a0505, transparent 50%), radial-gradient(circle at 90% 50%, #0a0a1a, transparent 50%), linear-gradient(135deg, #1a0000, #0f0000, #0a0a1a, #1a0000)'
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
