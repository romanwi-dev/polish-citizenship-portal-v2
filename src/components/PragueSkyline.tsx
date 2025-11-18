import pragueSkyline from "@/assets/prague-skyline.png";

export const PragueSkyline = () => {
  return (
    <div className="relative z-10 w-full flex justify-center">
      <div className="w-full md:w-[60%]">
        <img 
          src={pragueSkyline} 
          alt="Prague skyline silhouette" 
          className="w-full h-auto transition-all duration-300 block"
          style={{
            filter: 'brightness(0) invert(0.7) contrast(3) brightness(1.5)',
          }}
        />
      </div>
    </div>
  );
};
