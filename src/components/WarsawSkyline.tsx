import { memo } from "react";
import warsawSkyline from "@/assets/warsaw-skyline.png";

// PERF: Memoized to prevent unnecessary re-renders when used multiple times on page
export const WarsawSkyline = memo(() => {
  return (
    // CLS FIX: Container with explicit aspect ratio to prevent layout shift
    <div className="relative z-10 w-full flex justify-center" style={{ minHeight: '200px' }}>
      <div className="w-full md:w-[60%]">
        <img 
          src={warsawSkyline} 
          alt="Warsaw skyline silhouette"
          // CLS FIX: Added explicit dimensions to prevent layout shift
          width="1920"
          height="640"
          className="w-full h-auto opacity-70 dark:opacity-40 transition-all duration-300 block dark:invert"
          style={{
            filter: 'var(--skyline-filter)',
          }}
          loading="lazy"
          decoding="async"
        />
      </div>
    </div>
  );
});

WarsawSkyline.displayName = 'WarsawSkyline';
