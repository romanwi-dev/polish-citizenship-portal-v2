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
    <div className="w-full py-12 flex items-center justify-center overflow-hidden">
      <div
        className={`transition-all duration-1000 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <img
          src={imagePath}
          alt={`${cityName} landmark`}
          className="w-full max-w-[600px] h-auto object-contain md:max-w-[500px] opacity-70 hover:opacity-90 transition-opacity duration-300"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default CityDivider;
