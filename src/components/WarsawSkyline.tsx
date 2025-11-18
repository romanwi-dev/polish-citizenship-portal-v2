import warsawSkyline from "@/assets/warsaw-skyline.png";

export const WarsawSkyline = () => {
  return (
    <div className="w-screen relative left-[50%] right-[50%] ml-[-50vw] mr-[-50vw] z-10 overflow-hidden -mb-12 md:-mb-16">
      <img 
        src={warsawSkyline} 
        alt="Warsaw skyline silhouette" 
        className="w-full h-auto opacity-30 dark:opacity-40 transition-all duration-300"
        style={{
          filter: 'var(--skyline-filter)',
        }}
      />
    </div>
  );
};
