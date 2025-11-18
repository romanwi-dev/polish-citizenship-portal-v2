import warsawSkyline from "@/assets/warsaw-skyline.png";

export const WarsawSkyline = () => {
  return (
    <div className="w-full py-12 md:py-16 relative z-10 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative w-full max-w-6xl mx-auto">
          {/* Skyline image - inverted in dark mode, normal in light mode */}
          <img 
            src={warsawSkyline} 
            alt="Warsaw skyline silhouette" 
            className="w-full h-auto opacity-20 dark:opacity-30 dark:invert transition-all duration-300"
            style={{
              filter: 'brightness(1.2) contrast(1.1)',
            }}
          />
        </div>
      </div>
    </div>
  );
};
