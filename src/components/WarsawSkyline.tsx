import warsawSkyline from "@/assets/warsaw-skyline.png";

export const WarsawSkyline = () => {
  return (
    <div className="relative z-10 w-full flex justify-center px-0">
      <div className="w-full md:w-[60%]">
        <img 
          src={warsawSkyline} 
          alt="Warsaw skyline silhouette" 
          className="w-full h-auto opacity-70 dark:opacity-40 transition-all duration-300 block dark:invert"
          style={{
            filter: 'var(--skyline-filter)',
          }}
        />
      </div>
    </div>
  );
};
