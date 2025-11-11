import warsawCulturalHub from "@/assets/warsaw-demos/warsaw-9.png";

export const RealisticWarsaw = () => {
  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Image background */}
      <img
        src={warsawCulturalHub}
        alt="Cultural Hub - Theater with interactive light displays"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-end justify-center pb-16 text-white">
        <div className="text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl">
            Warsaw Awaits
          </h1>
          <p className="text-xl md:text-2xl opacity-90 drop-shadow-lg">
            Your European Future
          </p>
        </div>
      </div>
    </div>
  );
};
