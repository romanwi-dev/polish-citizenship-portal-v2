import warsawSkyline from "@/assets/warsaw-skyline.jpeg";

interface SkylineDividerProps {
  imageSrc?: string;
  alt?: string;
}

const SkylineDivider = ({ imageSrc = warsawSkyline, alt = "Warsaw skyline" }: SkylineDividerProps) => {
  return (
    <div className="relative w-full my-8 md:my-12 overflow-hidden">
      {/* Background matching StaticHeritage */}
      <div 
        className="absolute inset-0 animate-color-wave bg-[length:200%_200%]"
        style={{
          backgroundImage: 'radial-gradient(circle at 20% 50%, hsl(0, 50%, 5%), transparent 50%), radial-gradient(circle at 80% 50%, hsl(240, 50%, 5%), transparent 50%), linear-gradient(135deg, hsl(0, 50%, 10%), hsl(240, 50%, 10%), hsl(0, 50%, 10%))'
        }}
      />
      
      {/* Full-width skyline image */}
      <div className="relative flex justify-center items-center py-8">
        <img 
          src={imageSrc} 
          alt={alt} 
          className="w-full h-auto object-cover opacity-60"
          style={{
            mixBlendMode: 'screen',
            filter: 'brightness(0.9) contrast(1.1)'
          }} 
        />
      </div>
      
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
