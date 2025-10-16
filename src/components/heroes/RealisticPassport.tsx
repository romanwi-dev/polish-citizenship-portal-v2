import { useEffect, useState } from 'react';

export const RealisticPassport = () => {
  const [currentImage, setCurrentImage] = useState(0);
  
  const images = [
    'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&q=80', // Passport travel
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80', // EU flags
    'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=1920&q=80', // Documents
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Slideshow background */}
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            idx === currentImage ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${img})` }}
          />
        </div>
      ))}
      
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center text-white">
        <div className="text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl">
            Polish Passport
          </h1>
          <p className="text-xl md:text-2xl opacity-90 drop-shadow-lg">
            Your Gateway to Europe
          </p>
        </div>
      </div>
    </div>
  );
};
