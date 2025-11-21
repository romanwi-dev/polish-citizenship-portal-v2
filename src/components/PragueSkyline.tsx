const PragueSkyline = () => {
  return (
    <div className="relative z-10 w-full flex justify-center">
      <div className="w-full md:w-[60%]">
        <svg
          viewBox="0 0 2400 400"
          className="w-full h-auto opacity-70 dark:opacity-40 transition-all duration-300 text-foreground"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Prague skyline silhouette"
        >
          {/* Prague Castle complex */}
          <path
            d="M200 180 L220 160 L240 180 L240 280 L200 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* St. Vitus Cathedral spires */}
          <path
            d="M260 100 L270 80 L280 100 L280 280 L260 280 Z M300 120 L310 100 L320 120 L320 280 L300 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Charles Bridge towers */}
          <path
            d="M450 200 L450 280 M450 200 L460 180 L470 200 M470 200 L470 280 M520 200 L520 280 M520 200 L530 180 L540 200 M540 200 L540 280"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Old Town buildings */}
          <path
            d="M600 220 L620 220 L620 280 L600 280 Z M640 200 L660 200 L660 280 L640 280 Z M680 210 L700 210 L700 280 L680 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Astronomical Clock tower */}
          <path
            d="M750 150 L770 150 L770 280 M750 150 L760 130 L770 150 M755 180 Q760 185 765 180 Q760 175 755 180"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Powder Tower */}
          <path
            d="M850 170 L850 280 M850 170 L860 150 L870 170 M870 170 L870 280 M850 170 L870 170"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Dancing House */}
          <path
            d="M950 200 Q960 180 970 200 L970 280 L950 280 Z M990 210 L1010 200 L1010 280 L990 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* TV Tower */}
          <path
            d="M1100 100 L1100 280 M1090 120 L1110 120 M1090 140 L1110 140 M1090 160 L1110 160"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Modern buildings */}
          <path
            d="M1150 220 L1170 220 L1170 280 L1150 280 Z M1190 200 L1210 200 L1210 280 L1190 280 Z M1230 230 L1250 230 L1250 280 L1230 280 Z M1270 210 L1290 210 L1290 280 L1270 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Petřín Lookout Tower */}
          <path
            d="M1350 120 L1360 280 M1370 120 L1360 280 M1355 150 L1365 150 M1355 180 L1365 180 M1355 210 L1365 210 M1355 240 L1365 240"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Additional historic buildings */}
          <path
            d="M1420 230 L1440 230 L1440 280 L1420 280 Z M1460 220 L1480 220 L1480 280 L1460 280 Z M1500 240 L1520 240 L1520 280 L1500 280 Z M1540 210 L1560 210 L1560 280 L1540 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* More castle structures */}
          <path
            d="M1600 190 L1620 190 L1620 280 L1600 280 M1610 170 L1620 160 L1630 170 M1650 200 L1670 200 L1670 280 L1650 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Church spires */}
          <path
            d="M1720 140 L1730 120 L1740 140 L1740 280 L1720 280 Z M1780 160 L1790 140 L1800 160 L1800 280 L1780 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Residential buildings */}
          <path
            d="M1850 250 L1870 250 L1870 280 L1850 280 Z M1890 240 L1910 240 L1910 280 L1890 280 Z M1930 260 L1950 260 L1950 280 L1930 280 Z M1970 245 L1990 245 L1990 280 L1970 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Final towers */}
          <path
            d="M2050 200 L2060 180 L2070 200 L2070 280 L2050 280 Z M2110 190 L2130 190 L2130 280 L2110 280 Z M2160 220 L2180 220 L2180 280 L2160 280 Z M2200 210 L2220 210 L2220 280 L2200 280 Z"
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

export default PragueSkyline;
