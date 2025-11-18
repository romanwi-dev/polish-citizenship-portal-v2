import budapestSkyline from "@/assets/budapest-lineart.png";

export const BudapestSkyline = () => {
  return (
    <div className="relative z-10 w-full flex justify-center">
      <div className="w-full md:w-[60%]">
        <img 
          src={budapestSkyline} 
          alt="Budapest skyline silhouette" 
          className="w-full h-auto opacity-70 dark:opacity-40 transition-all duration-300 block dark:invert"
          style={{
            filter: 'var(--skyline-filter)',
          }}
        />
      </div>
    </div>
  );
};
