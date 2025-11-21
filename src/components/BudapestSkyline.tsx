import budapestSkyline from "@/assets/budapest-skyline.png";

const BudapestSkyline = () => {
  return (
    <div className="relative z-10 w-full flex justify-center" style={{ minHeight: '200px' }}>
      <div className="w-full md:w-[60%]">
        <img 
          src={budapestSkyline} 
          alt="Budapest skyline silhouette" 
          width="1920"
          height="640"
          className="w-full h-auto opacity-70 dark:opacity-40 transition-all duration-300 block dark:invert"
          loading="lazy"
          decoding="async"
          style={{
            filter: 'var(--skyline-filter)',
          }}
        />
      </div>
    </div>
  );
};

export default BudapestSkyline;
