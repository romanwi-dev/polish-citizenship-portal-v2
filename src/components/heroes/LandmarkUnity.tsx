import europeanUnity from "@/assets/footer/european-unity-3d.jpg";

export const LandmarkUnity = () => {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
      <img 
        src={europeanUnity} 
        alt="European Unity - Circle of golden stars with European landmarks representing EU citizenship" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
    </div>
  );
};
