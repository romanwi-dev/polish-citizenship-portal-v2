import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useNetworkAware } from "@/hooks/useNetworkAware";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}

/**
 * Lazy-loaded image component with Intersection Observer
 * Network-aware preloading for better performance
 */
export const LazyImage = ({ src, alt, className = "", placeholder }: LazyImageProps) => {
  const connection = useNetworkAware();
  const [imageSrc, setImageSrc] = useState<string | undefined>(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Adjust preload margin based on connection speed
  const preloadMargin = connection === '4g' || connection === 'wifi' ? '200px' : '50px';
  
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: preloadMargin
  });

  useEffect(() => {
    if (inView && !isLoaded) {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
    }
  }, [inView, src, isLoaded]);

  return (
    <div ref={ref} className="relative overflow-hidden">
      <img
        src={imageSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-50'} ${className}`}
        loading="lazy"
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
};
