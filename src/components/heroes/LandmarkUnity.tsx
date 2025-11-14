import brusselsUnity from "@/assets/eu-celebration/celebration-17.png";

export const LandmarkUnity = () => {
  return (
    <div className="relative w-full h-[300px] md:h-auto overflow-hidden">
      {/* Image background - Brussels Unity at golden hour */}
      <img
        src={brusselsUnity}
        alt="Brussels Unity - City square celebration at golden hour"
        className="absolute inset-0 w-full h-full md:h-auto object-cover object-bottom brightness-50"
      />
    </div>
  );
};
