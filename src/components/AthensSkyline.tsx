const AthensSkyline = () => {
  return (
    <div className="relative z-10 w-full flex justify-center">
      <div className="w-full md:w-[60%]">
        <svg
          viewBox="0 0 2400 400"
          className="w-full h-auto opacity-70 dark:opacity-40 transition-all duration-300 text-foreground"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Athens skyline silhouette"
        >
          {/* Acropolis/Parthenon */}
          <path
            d="M300 150 L300 280 M500 150 L500 280 M300 150 L400 130 L500 150 M320 170 L480 170 M320 170 L320 280 M340 170 L340 280 M360 170 L360 280 M380 170 L380 280 M400 170 L400 280 M420 170 L420 280 M440 170 L440 280 M460 170 L460 280 M480 170 L480 280"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Temple of Olympian Zeus columns */}
          <path
            d="M600 200 L600 280 M620 200 L620 280 M640 200 L640 280 M660 200 L660 280 M680 200 L680 280 M700 200 L700 280"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Odeon of Herodes Atticus */}
          <path
            d="M780 220 Q820 200 860 220 L860 280 L780 280 M790 240 L850 240 M790 260 L850 260"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Ancient Agora */}
          <path
            d="M940 230 L940 280 M960 230 L960 280 M980 230 L980 280 M1000 230 L1000 280 M940 230 L1000 230"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Modern Athens buildings */}
          <path
            d="M1080 240 L1100 240 L1100 280 L1080 280 Z M1120 235 L1140 235 L1140 280 L1120 280 Z M1160 245 L1180 245 L1180 280 L1160 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Syntagma Square buildings */}
          <path
            d="M1250 210 L1250 280 M1330 210 L1330 280 M1250 210 L1290 190 L1330 210 M1260 230 L1320 230 M1260 250 L1320 250"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Lycabettus Hill chapel */}
          <path
            d="M1420 180 L1430 160 L1440 180 L1440 280 L1420 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Residential buildings */}
          <path
            d="M1520 250 L1540 250 L1540 280 L1520 280 Z M1560 245 L1580 245 L1580 280 L1560 280 Z M1600 255 L1620 255 L1620 280 L1600 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* National Library */}
          <path
            d="M1700 220 L1700 280 M1760 220 L1760 280 M1700 220 L1730 200 L1760 220 M1710 240 L1750 240 M1710 260 L1750 260"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Academy of Athens */}
          <path
            d="M1840 210 L1840 280 M1900 210 L1900 280 M1840 210 L1870 190 L1900 210 M1850 230 L1890 230 M1850 250 L1890 250 M1860 190 L1865 170 L1870 190 M1880 190 L1885 170 L1890 190"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Modern high-rises */}
          <path
            d="M1980 200 L2000 200 L2000 280 L1980 280 Z M2020 190 L2040 190 L2040 280 L2020 280 Z M2060 210 L2080 210 L2080 280 L2060 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* More classical columns */}
          <path
            d="M2140 240 L2140 280 M2160 240 L2160 280 M2180 240 L2180 280 M2200 240 L2200 280"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Final buildings */}
          <path
            d="M2260 250 L2280 250 L2280 280 L2260 280 Z M2300 245 L2320 245 L2320 280 L2300 280 Z M2340 255 L2360 255 L2360 280 L2340 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Horizon line */}
          <path
            d="M0 280 L2400 280"
            stroke="currentColor"
            strokeWidth="1"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
};

export default AthensSkyline;
