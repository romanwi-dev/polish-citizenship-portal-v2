import warsawSkyline from "@/assets/warsaw-skyline.png";

export const WarsawSkyline = () => {
  return (
    <div className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] z-10">
      <img 
        src={warsawSkyline} 
        alt="Warsaw skyline silhouette" 
        className="w-full h-auto opacity-70 dark:opacity-40 transition-all duration-300 block"
        style={{
          filter: 'var(--skyline-filter)',
        }}
      />
    </div>
  );
};
