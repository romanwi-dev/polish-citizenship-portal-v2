import warsawSkyline from "@/assets/warsaw-skyline.jpeg";

interface SkylineDividerProps {
  imageSrc?: string;
  alt?: string;
}

const SkylineDivider = ({ imageSrc = warsawSkyline, alt = "Warsaw skyline" }: SkylineDividerProps) => {
  return (
    <div className="relative w-full my-8 md:my-12 overflow-hidden h-[300px] md:h-[400px]">
      {/* Background matching StaticHeritage */}
      <div 
        className="absolute inset-0 animate-color-wave bg-[length:200%_200%]"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(0, 50%, 5%), transparent 50%), radial-gradient(circle at 80% 50%, hsl(240, 50%, 5%), transparent 50%), linear-gradient(135deg, hsl(0, 50%, 10%), hsl(240, 50%, 10%), hsl(0, 50%, 10%))'
        }}
      />
      
      {/* Full-width skyline image with better visibility */}
      <div className="absolute inset-0">
        <img 
          src={imageSrc} 
          alt={alt} 
          className="w-full h-full object-cover opacity-80"
          style={{
            mixBlendMode: 'lighten',
            filter: 'brightness(1.1) contrast(1.2) saturate(0.8)'
          }} 
        />
      </div>
      
      {/* Gradient overlay for better blend */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/20" />
      
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
