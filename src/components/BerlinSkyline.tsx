import berlinSkyline from "@/assets/berlin-skyline.png";

const BerlinSkyline = () => {
  return (
    <div className="relative z-10 w-full flex justify-center" style={{ minHeight: '200px' }}>
      <div className="w-full md:w-[60%]">
        <img 
          src={berlinSkyline} 
          alt="Berlin skyline silhouette" 
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

export default BerlinSkyline;
