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
        className="w-auto opacity-30 hover:opacity-50 transition-opacity duration-300"
        style={{ 
          height: '180px',
          maxWidth: '90vw',
          objectFit: 'contain',
          mixBlendMode: 'screen'
        }}
        loading="lazy"
      />
    </div>
  );
};
