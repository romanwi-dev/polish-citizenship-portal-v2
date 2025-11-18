import warsawSkyline from "@/assets/warsaw-skyline.png";

export const WarsawSkyline = () => {
  return (
    <div 
      className="relative z-10 -mx-[9999px] px-[9999px]"
      style={{
        boxSizing: 'content-box',
      }}
    >
      <img 
        src={warsawSkyline} 
        alt="Warsaw skyline silhouette" 
        className="w-full h-auto opacity-30 dark:opacity-40 transition-all duration-300 block"
        style={{
          filter: 'var(--skyline-filter)',
        }}
      />
    </div>
  );
};
