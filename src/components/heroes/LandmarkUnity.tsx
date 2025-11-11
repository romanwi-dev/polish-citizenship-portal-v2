import unityCelebration from "@/assets/unity-celebration.jpg";

export const LandmarkUnity = () => {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
      {/* Image background - cropped from top and darkened */}
      <img
        src={unityCelebration}
        alt="Unity Celebration - Massive crowd celebrating with EU flags and fireworks"
        className="absolute inset-0 w-full h-full object-cover object-bottom brightness-50"
      />
    </div>
  );
};
