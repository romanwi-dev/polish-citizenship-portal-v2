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
    <div className="w-full py-16 flex items-center justify-center overflow-hidden">
      <div
        className={`transition-all duration-1000 ease-out ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        <img
          src={imagePath}
          alt={`${cityName} landmark`}
          className="w-full max-w-[700px] h-auto object-contain md:max-w-[600px] opacity-30 hover:opacity-50 transition-opacity duration-500 mix-blend-lighten"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default CityDivider;
