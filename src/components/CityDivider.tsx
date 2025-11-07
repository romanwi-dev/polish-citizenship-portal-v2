import { useEffect, useState } from "react";

interface CityDividerProps {
  cityName: string;
  imagePath: string;
}

const CityDivider = ({ cityName, imagePath }: CityDividerProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="w-full flex items-center justify-center overflow-hidden -my-8">
      <div
        className={`transition-all duration-1000 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <img
          src={imagePath}
          alt={`${cityName} landmark`}
          className="w-full max-w-[800px] h-auto object-contain opacity-20 hover:opacity-35 transition-opacity duration-500"
          loading="lazy"
          style={{ filter: 'brightness(1.8)' }}
        />
      </div>
    </div>
  );
};

export default CityDivider;
