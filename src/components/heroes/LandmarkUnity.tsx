import europeHolographic from "@/assets/footer/europe-holographic-celebration.jpg";

export const LandmarkUnity = () => {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
      <img 
        src={europeHolographic} 
        alt="Premium holographic European celebration - Single illuminated Eiffel Tower with fireworks and Alpine mountains" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
    </div>
  );
};
