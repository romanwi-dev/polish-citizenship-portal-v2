const BrusselsSkyline = () => {
  return (
    <div className="relative z-10 w-full flex justify-center">
      <div className="w-full md:w-[60%]">
        <svg
          viewBox="0 0 2400 400"
          className="w-full h-auto opacity-70 dark:opacity-40 transition-all duration-300 text-foreground"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Brussels skyline silhouette"
        >
          {/* Atomium */}
          <path
            d="M250 120 L300 120 M250 170 L300 170 M250 220 L300 220 M275 120 L275 220 M250 120 L275 170 M300 120 L275 170 M250 170 L275 220 M300 170 L275 220 M260 120 Q265 115 270 120 M260 170 Q265 165 270 170 M260 220 Q265 215 270 220 M280 120 Q285 115 290 120 M280 170 Q285 165 290 170 M280 220 Q285 215 290 220"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Grand Place/Town Hall */}
          <path
            d="M450 180 L450 280 M520 180 L520 280 M450 180 L485 160 L520 180 M460 200 L510 200 M460 220 L510 220 M460 240 L510 240 M485 160 L490 130 L495 160 M490 130 L495 100 L500 130"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Manneken Pis fountain structure */}
          <path
            d="M620 240 L620 280 M650 240 L650 280 M620 240 L635 230 L650 240"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Royal Palace */}
          <path
            d="M730 200 L730 280 M820 200 L820 280 M730 200 L775 180 L820 200 M740 220 L810 220 M740 240 L810 240 M740 260 L810 260"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Palais de Justice */}
          <path
            d="M900 170 L900 280 M980 170 L980 280 M900 170 L940 150 L980 170 M910 190 L970 190 M910 210 L970 210 M910 230 L970 230 M910 250 L970 250 M940 150 L945 130 L950 150"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* European Parliament */}
          <path
            d="M1060 190 L1060 280 M1130 190 L1130 280 M1060 190 L1095 170 L1130 190 M1070 210 L1120 210 M1070 230 L1120 230 M1070 250 L1120 250"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Cinquantenaire Arch */}
          <path
            d="M1220 210 L1220 280 M1280 210 L1280 280 M1220 210 L1250 190 L1280 210 M1230 230 L1270 230 M1230 230 L1230 280 M1270 230 L1270 280 M1250 190 L1255 170 L1260 190"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Modern EU buildings */}
          <path
            d="M1360 200 L1380 200 L1380 280 L1360 280 Z M1400 190 L1420 190 L1420 280 L1400 280 Z M1440 210 L1460 210 L1460 280 L1440 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Basilica of the Sacred Heart */}
          <path
            d="M1540 170 Q1570 150 1600 170 L1600 280 L1540 280 Z M1570 150 L1575 130 L1580 150 M1575 130 L1580 110 L1585 130"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Art Nouveau buildings */}
          <path
            d="M1680 230 L1700 230 L1700 280 L1680 280 M1685 220 L1695 210 L1705 220 M1720 235 L1740 235 L1740 280 L1720 280 M1725 225 L1735 215 L1745 225"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Gothic churches */}
          <path
            d="M1820 190 L1830 170 L1840 190 L1840 280 L1820 280 Z M1900 200 L1910 180 L1920 200 L1920 280 L1900 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Residential buildings */}
          <path
            d="M2000 240 L2020 240 L2020 280 L2000 280 Z M2040 245 L2060 245 L2060 280 L2040 280 Z M2080 235 L2100 235 L2100 280 L2080 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Berlaymont building */}
          <path
            d="M2180 180 L2180 280 M2240 180 L2240 280 M2180 180 L2240 180 M2180 210 L2240 210 M2180 240 L2240 240 M2180 280 L2240 280"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Final structures */}
          <path
            d="M2300 230 L2320 230 L2320 280 L2300 280 Z M2340 240 L2360 240 L2360 280 L2340 280 Z"
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

export default BrusselsSkyline;
