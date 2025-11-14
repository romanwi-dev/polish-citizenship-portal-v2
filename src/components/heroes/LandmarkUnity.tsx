import europeNightHolographic from "@/assets/footer/europe-night-holographic.jpg";

export const LandmarkUnity = () => {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
      <img 
        src={europeNightHolographic} 
        alt="Premium holographic European night scene - Single illuminated Eiffel Tower with Alpine mountains and river reflections" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
    </div>
  );
};
