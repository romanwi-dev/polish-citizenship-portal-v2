import warsawSkyline from "@/assets/warsaw-skyline.png";

export const WarsawSkyline = () => {
  return (
    <div className="w-full relative overflow-hidden">
      <div className="absolute inset-0 w-screen left-1/2 -translate-x-1/2">
        <img 
          src={warsawSkyline} 
          alt="Warsaw skyline silhouette" 
          className="w-full h-auto opacity-30 dark:opacity-40 transition-all duration-300 block"
          style={{
            filter: 'var(--skyline-filter)',
          }}
        />
      </div>
      <img 
        src={warsawSkyline} 
        alt="" 
        className="w-full h-auto opacity-0 pointer-events-none"
      />
    </div>
  );
};
