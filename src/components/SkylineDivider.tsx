interface SkylineDividerProps {
  imageSrc: string;
  alt: string;
}

const SkylineDivider = ({ imageSrc, alt }: SkylineDividerProps) => {
  return (
    <div className="w-full my-8 md:my-12 flex justify-center items-center">
      <img 
        src={imageSrc} 
        alt={alt} 
        className="max-w-3xl w-full opacity-70 md:opacity-50" 
        style={{
          mixBlendMode: 'screen',
          filter: 'invert(1) brightness(0.9)'
        }} 
      />
    </div>
  );
};

export default SkylineDivider;
