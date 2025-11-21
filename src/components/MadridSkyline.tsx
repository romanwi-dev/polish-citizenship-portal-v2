const MadridSkyline = () => {
  return (
    <div className="relative z-10 w-full flex justify-center">
      <div className="w-full md:w-[60%]">
        <svg
          viewBox="0 0 2400 400"
          className="w-full h-auto opacity-70 dark:opacity-40 transition-all duration-300 text-foreground"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Madrid skyline silhouette"
        >
          {/* Royal Palace */}
          <path
            d="M200 190 L200 280 M300 190 L300 280 M200 190 L250 170 L300 190 M220 220 L280 220 M220 250 L280 250"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Almudena Cathedral */}
          <path
            d="M350 180 L360 160 L370 180 M390 180 L400 160 L410 180 M350 180 L350 280 M370 180 L370 280 M390 180 L390 280 M410 180 L410 280"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Metropolis Building */}
          <path
            d="M500 200 L500 280 M540 200 L540 280 M500 200 L520 180 L540 200 M520 180 L525 160 L530 180"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Telefónica Building */}
          <path
            d="M650 150 L650 280 M690 150 L690 280 M650 150 L690 150 M650 190 L690 190 M650 230 L690 230"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Gran Vía buildings */}
          <path
            d="M750 220 L770 220 L770 280 L750 280 Z M790 210 L810 210 L810 280 L790 280 Z M830 225 L850 225 L850 280 L830 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Cibeles Palace */}
          <path
            d="M920 200 L920 280 M970 200 L970 280 M920 200 L945 180 L970 200 M935 210 L955 210 M935 210 L935 280 M955 210 L955 280"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Torres de Colón */}
          <path
            d="M1050 180 L1050 280 M1080 180 L1080 280 M1050 180 L1080 180 M1050 280 L1080 280 M1055 200 L1075 200 M1055 240 L1075 240"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Cuatro Torres */}
          <path
            d="M1150 120 L1150 280 M1190 130 L1190 280 M1230 125 L1230 280 M1270 135 L1270 280"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Torre Picasso */}
          <path
            d="M1350 160 L1350 280 M1380 160 L1380 280 M1350 160 L1380 160 M1350 280 L1380 280"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Residential buildings */}
          <path
            d="M1450 230 L1470 230 L1470 280 L1450 280 Z M1490 240 L1510 240 L1510 280 L1490 280 Z M1530 235 L1550 235 L1550 280 L1530 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Puerta de Alcalá */}
          <path
            d="M1620 210 L1620 280 M1660 210 L1660 280 M1620 210 L1640 190 L1660 210 M1625 230 L1635 230 M1625 230 L1625 280 M1645 230 L1655 230 M1645 230 L1645 280"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* More modern buildings */}
          <path
            d="M1730 220 L1750 220 L1750 280 L1730 280 Z M1770 210 L1790 210 L1790 280 L1770 280 Z M1810 225 L1830 225 L1830 280 L1810 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Torre Europa */}
          <path
            d="M1900 170 L1900 280 M1930 170 L1930 280 M1900 170 L1930 170 M1900 280 L1930 280"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Additional buildings */}
          <path
            d="M2000 240 L2020 240 L2020 280 L2000 280 Z M2040 235 L2060 235 L2060 280 L2040 280 Z M2080 245 L2100 245 L2100 280 L2080 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Final structures */}
          <path
            d="M2150 230 L2170 230 L2170 280 L2150 280 Z M2190 220 L2210 220 L2210 280 L2190 280 Z M2230 240 L2250 240 L2250 280 L2230 280 Z"
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

export default MadridSkyline;
