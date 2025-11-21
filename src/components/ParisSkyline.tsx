const ParisSkyline = () => {
  return (
    <div className="relative z-10 w-full flex justify-center">
      <div className="w-full md:w-[60%]">
        <svg
          viewBox="0 0 2400 400"
          className="w-full h-auto opacity-70 dark:opacity-40 transition-all duration-300 text-foreground"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Paris skyline silhouette"
        >
          {/* Eiffel Tower */}
          <path
            d="M300 80 L350 280 M400 80 L350 280 M320 150 L380 150 M325 200 L375 200 M330 250 L370 250"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Arc de Triomphe */}
          <path
            d="M500 200 L500 280 M580 200 L580 280 M500 200 L540 180 L580 200 M520 230 L560 230 M520 230 L520 280 M560 230 L560 280"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Notre-Dame */}
          <path
            d="M700 180 L710 160 L720 180 M750 180 L760 160 L770 180 M700 180 L700 280 M720 180 L720 280 M750 180 L750 280 M770 180 L770 280 M690 220 L780 220"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Sacré-Cœur */}
          <path
            d="M900 160 Q920 140 940 160 L940 280 L900 280 Z M920 140 L925 120 L930 140"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Panthéon */}
          <path
            d="M1050 190 L1050 280 M1120 190 L1120 280 M1050 190 L1085 160 L1120 190 M1060 220 L1110 220"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Louvre pyramid */}
          <path
            d="M1200 220 L1240 280 M1280 220 L1240 280 M1220 240 L1260 240"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* La Défense */}
          <path
            d="M1350 180 L1350 280 M1380 180 L1380 280 M1350 180 L1380 180 M1350 230 L1380 230 M1350 280 L1380 280"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Haussmann buildings */}
          <path
            d="M1450 220 L1470 220 L1470 280 L1450 280 Z M1490 230 L1510 230 L1510 280 L1490 280 Z M1530 225 L1550 225 L1550 280 L1530 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Montparnasse Tower */}
          <path
            d="M1600 140 L1600 280 M1640 140 L1640 280 M1600 140 L1640 140 M1600 280 L1640 280"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Les Invalides dome */}
          <path
            d="M1720 180 Q1750 160 1780 180 L1780 280 L1720 280 Z M1750 160 L1755 140 L1760 160"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* More Haussmann buildings */}
          <path
            d="M1850 240 L1870 240 L1870 280 L1850 280 Z M1890 235 L1910 235 L1910 280 L1890 280 Z M1930 245 L1950 245 L1950 280 L1930 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Opera Garnier */}
          <path
            d="M2000 200 L2000 280 M2060 200 L2060 280 M2000 200 L2030 180 L2060 200 M2030 180 L2035 170 L2040 180"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Modern buildings */}
          <path
            d="M2120 210 L2140 210 L2140 280 L2120 280 Z M2160 220 L2180 220 L2180 280 L2160 280 Z M2200 230 L2220 230 L2220 280 L2200 280 Z"
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

export default ParisSkyline;
