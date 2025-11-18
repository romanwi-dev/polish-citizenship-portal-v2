import pragueSkyline from "@/assets/prague-skyline.png";

export const PragueSkyline = () => {
  return (
    <div className="relative z-10 w-full flex md:justify-center">
      <div className="w-full md:w-[60%]">
        <img 
          src={pragueSkyline} 
          alt="Prague skyline silhouette" 
          className="w-full h-auto opacity-70 dark:opacity-40 transition-all duration-300 block"
        />
      </div>
    </div>
  );
};
