import landmarkUnity from "@/assets/eu-celebration/celebration-4.png";

export const LandmarkUnity = () => {
  return (
    <div className="relative w-full h-96 overflow-hidden">
      {/* Image background */}
      <img
        src={landmarkUnity}
        alt="Landmark Unity - European landmarks illuminated with EU colors"
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-end justify-center pb-12 text-white">
        <div className="text-center px-4">
          <h2 className="text-4xl md:text-5xl font-bold mb-3 drop-shadow-2xl">
            Your European Heritage Awaits
          </h2>
          <p className="text-lg md:text-xl opacity-90 drop-shadow-lg">
            Join thousands who've reclaimed their Polish citizenship
          </p>
        </div>
      </div>
    </div>
  );
};
