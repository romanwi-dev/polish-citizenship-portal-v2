import budapestSkyline from "@/assets/budapest-skyline.png";

export const BudapestSkyline = () => {
  return (
    <div className="relative z-10 w-full flex justify-center">
      <div className="w-full md:w-[60%]">
        <img 
          src={budapestSkyline} 
          alt="Budapest skyline silhouette" 
          className="w-full h-auto opacity-40 dark:opacity-70 transition-all duration-300 block invert dark:invert-0"
          style={{
            filter: 'var(--skyline-filter)',
          }}
        />
      </div>
    </div>
  );
};
