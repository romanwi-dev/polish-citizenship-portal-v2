import landmarkUnity from "@/assets/eu-celebration/celebration-4.png";

export const LandmarkUnity = () => {
  return (
    <div className="relative w-full h-[500px] md:h-[700px] overflow-hidden">
      {/* Image background */}
      <img
        src={landmarkUnity}
        alt="Landmark Unity - European landmarks illuminated with EU colors"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
};
