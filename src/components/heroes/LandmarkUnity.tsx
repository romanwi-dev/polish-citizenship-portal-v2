import euUnityCelebration from "@/assets/hero/eu-unity-celebration.jpg";

export const LandmarkUnity = () => {
  return (
    <div className="relative w-full h-[300px] md:h-auto overflow-hidden">
      {/* Image background - EU Unity Celebration at golden hour */}
      <img
        src={euUnityCelebration}
        alt="EU Unity Celebration - Massive crowd celebrating in historic city square at golden hour"
        className="absolute inset-0 w-full h-full md:h-auto object-cover object-bottom brightness-50"
      />
    </div>
  );
};
