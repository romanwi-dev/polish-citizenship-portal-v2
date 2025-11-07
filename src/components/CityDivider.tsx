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
        className="w-auto opacity-25 hover:opacity-40 transition-opacity duration-300"
        style={{ 
          height: '200px',
          maxWidth: '90vw',
          objectFit: 'contain',
          filter: 'brightness(0) invert(1)',
          backgroundColor: 'transparent'
        }}
        loading="lazy"
      />
    </div>
  );
};
