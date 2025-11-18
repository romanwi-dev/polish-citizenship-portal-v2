import warsawSkyline from "@/assets/warsaw-skyline.png";

export const WarsawSkyline = () => {
  return (
    <div className="w-full py-0 relative z-10 overflow-hidden -mb-12 md:-mb-16">
      <div className="w-full px-0">
        <div className="relative w-full">
          {/* Skyline image - white in dark mode, black in light mode */}
          <img 
            src={warsawSkyline} 
            alt="Warsaw skyline silhouette" 
            className="w-full h-auto opacity-30 dark:opacity-40 transition-all duration-300"
            style={{
              filter: 'var(--skyline-filter)',
            }}
          />
        </div>
      </div>
    </div>
  );
};
