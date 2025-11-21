const RomeSkyline = () => {
  return (
    <div className="relative z-10 w-full flex justify-center">
      <div className="w-full md:w-[60%]">
        <svg
          viewBox="0 0 2400 400"
          className="w-full h-auto opacity-70 dark:opacity-40 transition-all duration-300 text-foreground"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
          aria-label="Rome skyline silhouette"
        >
          {/* Colosseum */}
          <path
            d="M200 200 L200 280 M280 200 L280 280 M200 200 Q240 180 280 200 M210 220 L270 220 M210 240 L270 240 M210 260 L270 260"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* St. Peter's Basilica dome */}
          <path
            d="M400 160 Q450 140 500 160 L500 280 L400 280 Z M450 140 L455 120 L460 140 M450 120 L455 100 L460 120"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Vatican obelisk */}
          <path
            d="M580 180 L580 280 M575 180 L585 180 M577 185 L583 185"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Pantheon */}
          <path
            d="M650 210 L650 280 M730 210 L730 280 M650 210 L690 190 L730 210 M660 230 L720 230"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Roman Forum columns */}
          <path
            d="M800 220 L800 280 M820 220 L820 280 M840 220 L840 280 M860 220 L860 280 M880 220 L880 280"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Castel Sant'Angelo */}
          <path
            d="M950 200 Q980 190 1010 200 L1010 280 L950 280 Z M980 190 L985 170 L990 190"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Trevi Fountain structure */}
          <path
            d="M1080 220 L1080 280 M1140 220 L1140 280 M1080 220 L1110 200 L1140 220 M1090 240 L1130 240 M1090 260 L1130 260"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Altare della Patria */}
          <path
            d="M1220 190 L1220 280 M1300 190 L1300 280 M1220 190 L1260 170 L1300 190 M1230 210 L1290 210 M1230 230 L1290 230 M1230 250 L1290 250"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Church domes */}
          <path
            d="M1380 180 Q1400 170 1420 180 L1420 280 L1380 280 Z M1400 170 L1405 160 L1410 170 M1480 190 Q1500 180 1520 190 L1520 280 L1480 280 Z M1500 180 L1505 170 L1510 180"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Spanish Steps area */}
          <path
            d="M1600 230 L1600 280 M1650 230 L1650 280 M1600 230 L1625 210 L1650 230 M1610 250 L1640 250"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Historic buildings */}
          <path
            d="M1720 240 L1740 240 L1740 280 L1720 280 Z M1760 235 L1780 235 L1780 280 L1760 280 Z M1800 245 L1820 245 L1820 280 L1800 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Piazza Navona obelisk */}
          <path
            d="M1880 200 L1880 280 M1875 200 L1885 200 M1877 205 L1883 205"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* More churches */}
          <path
            d="M1950 200 L1960 180 L1970 200 L1970 280 L1950 280 Z M2020 210 L2030 190 L2040 210 L2040 280 L2020 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Residential buildings */}
          <path
            d="M2110 250 L2130 250 L2130 280 L2110 280 Z M2150 245 L2170 245 L2170 280 L2150 280 Z M2190 255 L2210 255 L2210 280 L2190 280 Z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          {/* Final structures */}
          <path
            d="M2250 240 L2270 240 L2270 280 L2250 280 Z M2290 235 L2310 235 L2310 280 L2290 280 Z M2330 250 L2350 250 L2350 280 L2330 280 Z"
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

export default RomeSkyline;
