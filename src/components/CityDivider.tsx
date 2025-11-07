interface CityDividerProps {
  cityImage: string;
  alt: string;
}

export const CityDivider = ({ cityImage, alt }: CityDividerProps) => {
  return (
    <div className="flex justify-center mb-8">
      <img 
        src={cityImage} 
        alt={alt}
        className="h-16 w-auto opacity-30 hover:opacity-50 transition-opacity duration-300"
        loading="lazy"
      />
    </div>
  );
};
