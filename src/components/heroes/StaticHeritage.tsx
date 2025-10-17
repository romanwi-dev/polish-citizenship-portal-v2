export const StaticHeritage = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <div 
        className="absolute inset-0 animate-color-wave bg-[length:200%_200%]"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, #f5ebe0, transparent 50%), radial-gradient(circle at 60% 50%, #ede0d4, transparent 50%), radial-gradient(circle at 90% 50%, #e6ccb2, transparent 50%), linear-gradient(135deg, #f5ebe0, #ede0d4, #e6ccb2, #f5ebe0)'
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
