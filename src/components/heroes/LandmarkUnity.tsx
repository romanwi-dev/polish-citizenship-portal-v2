import unityCelebration from "@/assets/unity-celebration.jpg";

export const LandmarkUnity = () => {
  return (
    <div className="relative w-full h-[500px] md:h-[700px] overflow-hidden">
      {/* Image background */}
      <img
        src={unityCelebration}
        alt="Unity Celebration - Massive crowd celebrating with EU flags and fireworks"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
};
