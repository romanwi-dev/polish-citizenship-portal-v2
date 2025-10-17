export const StaticHeritage = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <div 
        className="absolute inset-0 animate-color-wave bg-[length:200%_200%]"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #5d1a1a, transparent 50%), radial-gradient(circle at 60% 50%, #6b1e1e, transparent 50%), radial-gradient(circle at 90% 50%, #4a1515, transparent 50%), linear-gradient(135deg, #5d1a1a, #6b1e1e, #4a1515, #5d1a1a)',
          backgroundColor: '#5d1a1a'
        }}
      />
      <div className="absolute inset-0 opacity-30 blur-sm pointer-events-none" />
      
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
