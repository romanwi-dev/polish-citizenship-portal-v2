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
        className="h-16 w-auto opacity-20 hover:opacity-40 transition-opacity duration-300"
        style={{ 
          mixBlendMode: 'screen',
          filter: 'brightness(1.2) contrast(1.1)'
        }}
        loading="lazy"
      />
    </div>
  );
};
