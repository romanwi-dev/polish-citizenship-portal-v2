// NOTE: Do not modify homepage text/layout from this component. Visual decoration only.

import pragueSkyline from "@/assets/skylines/prague-skyline.png";
import parisSkyline from "@/assets/skylines/paris-skyline.png";
import madridSkyline from "@/assets/skylines/madrid-skyline.png";
import romeSkyline from "@/assets/skylines/rome-skyline.png";
import athensSkyline from "@/assets/skylines/athens-skyline.png";
import brusselsSkyline from "@/assets/skylines/brussels-skyline.png";
import warsaw2Skyline from "@/assets/skylines/warsaw-2-skyline.png";

type CityName = "prague" | "paris" | "madrid" | "rome" | "athens" | "brussels" | "warsaw-2";

const skylineAssets: Record<CityName, string> = {
  "prague": pragueSkyline,
  "paris": parisSkyline,
  "madrid": madridSkyline,
  "rome": romeSkyline,
  "athens": athensSkyline,
  "brussels": brusselsSkyline,
  "warsaw-2": warsaw2Skyline,
};

interface CitySkylineProps {
  city: CityName;
}

export const CitySkyline = ({ city }: CitySkylineProps) => {
  return (
    <div className="relative z-10 w-full flex justify-center">
      <div className="w-full md:w-[60%]">
        <img 
          src={skylineAssets[city]} 
          alt={`${city} skyline silhouette`}
          className="w-full h-auto opacity-70 dark:opacity-40 transition-all duration-300 block dark:invert"
          style={{
            filter: 'var(--skyline-filter)',
          }}
          loading="lazy"
          aria-hidden="true"
        />
      </div>
    </div>
  );
};
