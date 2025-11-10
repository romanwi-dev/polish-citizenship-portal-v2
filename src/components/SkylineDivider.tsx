import warsawSkyline from "@/assets/warsaw-skyline-white.png";

interface SkylineDividerProps {
  imageSrc?: string;
  alt?: string;
}

const SkylineDivider = ({ imageSrc = warsawSkyline, alt = "Warsaw skyline" }: SkylineDividerProps) => {
  return (
    <div className="relative w-full my-8 md:my-12 overflow-hidden h-[200px] md:h-[300px]">
      {/* Background matching StaticHeritage */}
      <div 
        className="absolute inset-0 animate-color-wave bg-[length:200%_200%]"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(0, 50%, 5%), transparent 50%), radial-gradient(circle at 80% 50%, hsl(240, 50%, 5%), transparent 50%), linear-gradient(135deg, hsl(0, 50%, 10%), hsl(240, 50%, 10%), hsl(0, 50%, 10%))'
        }}
      />
      
      {/* Full-width skyline silhouette */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img 
          src={imageSrc} 
          alt={alt} 
          className="w-full h-full object-contain opacity-90"
          style={{
            filter: 'brightness(1.1)'
          }} 
        />
      </div>
      
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/10 via-transparent to-background/10" />
      
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

export default SkylineDivider;
