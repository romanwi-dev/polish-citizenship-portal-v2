interface CityDividerProps {
  cityImage: string;
  alt: string;
}

export const CityDivider = ({ cityImage, alt }: CityDividerProps) => {
  return (
    <div className="flex justify-center mb-12">
      <img 
        src={cityImage} 
        alt={alt}
        className="h-32 w-auto opacity-40 hover:opacity-60 transition-opacity duration-300"
        style={{ 
          mixBlendMode: 'screen',
          filter: 'brightness(2) contrast(1.5) invert(1)'
        }}
        loading="lazy"
      />
    </div>
  );
};
