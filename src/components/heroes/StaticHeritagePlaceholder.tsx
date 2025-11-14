export const StaticHeritagePlaceholder = () => {
  return (
    <>
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-background via-card to-background animate-slow-wave" />
      
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
