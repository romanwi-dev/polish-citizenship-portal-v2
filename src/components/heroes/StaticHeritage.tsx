export const StaticHeritage = () => {
  return (
    <div className="absolute inset-0 w-full h-full">
      <div className="absolute inset-0 animate-gradient bg-gradient-to-br from-[#3f1f1f] via-[#5c2e2e] to-[#2d2d2d] bg-[length:400%_400%]" />
      <div className="absolute inset-0 opacity-40 blur-sm pointer-events-none" />
      
      <style>{`
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-gradient {
          animation: gradient 8s ease infinite;
        }
      `}</style>
    </div>
  );
};
