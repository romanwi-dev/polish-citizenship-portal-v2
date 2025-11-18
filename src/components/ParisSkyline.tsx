import parisSkyline from "@/assets/paris-skyline.png";

export const ParisSkyline = () => {
  return (
    <div className="relative z-10 w-full flex md:justify-center">
      <div className="w-full md:w-[75%]">
        <img 
          src={parisSkyline} 
          alt="Paris skyline silhouette" 
          className="w-full h-auto opacity-70 dark:opacity-40 transition-all duration-300 block dark:invert"
          style={{
            filter: 'var(--skyline-filter)',
          }}
        />
      </div>
    </div>
  );
};
