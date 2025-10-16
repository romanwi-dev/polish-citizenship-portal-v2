export const RealisticLegal = () => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background image with Ken Burns effect */}
      <div className="absolute inset-0 animate-[ken-burns_20s_ease-in-out_infinite]">
        <div
          className="w-full h-full bg-cover bg-center scale-110"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1920&q=80)`,
          }}
        />
      </div>
      
      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/30 to-black/70" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-white">
        <div className="text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl">
            Expert Legal Guidance
          </h1>
          <p className="text-xl md:text-2xl opacity-90 drop-shadow-lg">
            Professional Citizenship Services
          </p>
        </div>
      </div>
    </div>
  );
};
