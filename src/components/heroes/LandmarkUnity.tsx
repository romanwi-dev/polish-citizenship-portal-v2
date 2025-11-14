import europeCelebration from "@/assets/footer/europe-celebration-diverse.jpg";

export const LandmarkUnity = () => {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden group">
      {/* Background Image */}
      <img 
        src={europeCelebration} 
        alt="European celebration - Multiple landmarks including Big Ben, historic bridges and colorful fireworks representing EU unity" 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
      
      {/* Celebration particles overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
              opacity: 0.6
            }}
          />
        ))}
      </div>
      
      {/* Firework bursts */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div
            key={`burst-${i}`}
            className="absolute w-32 h-32 opacity-0 animate-[scale-in_3s_ease-out_infinite]"
            style={{
              left: `${20 + i * 30}%`,
              top: `${10 + i * 15}%`,
              animationDelay: `${i * 1.2}s`,
              background: `radial-gradient(circle, rgba(var(--primary-rgb), 0.3) 0%, transparent 70%)`
            }}
          />
        ))}
      </div>
    </div>
  );
};
