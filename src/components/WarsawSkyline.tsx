import warsawSkyline from "@/assets/warsaw-skyline.png";

export const WarsawSkyline = () => {
  return (
    <div 
      className="relative z-10"
      style={{
        width: '100vw',
        marginLeft: 'calc(-50vw + 50%)',
        marginRight: 'calc(-50vw + 50%)',
      }}
    >
      <img 
        src={warsawSkyline} 
        alt="Warsaw skyline silhouette" 
        className="w-full h-auto opacity-30 dark:opacity-40 transition-all duration-300 block"
        style={{
          filter: 'var(--skyline-filter)',
          width: '100%',
          maxWidth: 'none',
        }}
      />
    </div>
  );
};
