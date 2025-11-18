import pragueSkyline from "@/assets/prague-skyline.png";

export const PragueSkyline = () => {
  return (
    <div className="relative z-10 w-full flex justify-center">
      <div className="w-full md:w-[60%]">
        <img 
          src={pragueSkyline} 
          alt="Prague skyline silhouette" 
          className="w-full h-auto opacity-40 dark:opacity-70 transition-all duration-300 block invert dark:invert-0"
          style={{
            filter: 'var(--skyline-filter)',
          }}
        />
      </div>
    </div>
  );
};
