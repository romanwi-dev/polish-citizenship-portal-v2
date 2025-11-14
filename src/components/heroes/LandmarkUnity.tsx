import europeNight from "@/assets/footer/europe-night-celebration-3d.jpg";

export const LandmarkUnity = () => {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
      <img 
        src={europeNight} 
        alt="European celebration at night - Illuminated landmarks with fireworks representing vibrant EU citizenship" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
    </div>
  );
};
