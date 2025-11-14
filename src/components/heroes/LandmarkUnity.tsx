import europeAerial from "@/assets/footer/europe-aerial-golden.jpg";

export const LandmarkUnity = () => {
  return (
    <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden">
      <img 
        src={europeAerial} 
        alt="European landscape at golden hour - Alpine mountains, historic European town and coastline representing EU citizenship" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
    </div>
  );
};
