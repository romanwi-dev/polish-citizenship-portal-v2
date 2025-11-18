import warsawSkyline from "@/assets/warsaw-skyline.png";

export const WarsawSkyline = () => {
  return (
    <div className="absolute left-0 right-0 w-full z-10 overflow-hidden -mb-12 md:-mb-16">
      <img 
        src={warsawSkyline} 
        alt="Warsaw skyline silhouette" 
        className="w-full min-w-full h-auto opacity-30 dark:opacity-40 transition-all duration-300 block"
        style={{
          filter: 'var(--skyline-filter)',
        }}
      />
    </div>
  );
};
