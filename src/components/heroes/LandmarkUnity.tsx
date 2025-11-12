import unityCelebration from "@/assets/unity-celebration.jpg";

export const LandmarkUnity = () => {
  return (
    <div className="relative w-full h-[300px] md:h-auto overflow-hidden">
      {/* Image background - cropped from top and darkened, same height as hero on desktop */}
      <img
        src={unityCelebration}
        alt="Unity Celebration - Massive crowd celebrating with EU flags and fireworks"
        className="absolute inset-0 w-full h-full md:h-auto object-cover object-bottom brightness-50"
      />
    </div>
  );
};
