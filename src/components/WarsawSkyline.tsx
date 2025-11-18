import warsawSkyline from "@/assets/warsaw-skyline.png";

export const WarsawSkyline = () => {
  return (
    <div className="w-full relative z-10 overflow-x-hidden -mb-12 md:-mb-16">
      <img 
        src={warsawSkyline} 
        alt="Warsaw skyline silhouette" 
        className="w-screen max-w-none h-auto opacity-30 dark:opacity-40 transition-all duration-300 relative left-1/2 -translate-x-1/2"
        style={{
          filter: 'var(--skyline-filter)',
        }}
      />
    </div>
  );
};
