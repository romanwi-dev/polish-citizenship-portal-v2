import romeSkyline from "@/assets/rome-skyline.png";

export const RomeSkyline = () => {
  return (
    <div className="relative z-10 w-full flex justify-center">
      <div className="w-full md:w-[60%]">
        <img 
          src={romeSkyline} 
          alt="Rome skyline silhouette" 
          className="w-full h-auto opacity-70 dark:opacity-40 transition-all duration-300 block dark:invert mix-blend-lighten dark:mix-blend-darken"
          style={{
            filter: 'var(--skyline-filter)',
          }}
        />
      </div>
    </div>
  );
};
