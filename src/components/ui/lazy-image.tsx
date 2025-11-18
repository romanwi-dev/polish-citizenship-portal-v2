import { useState, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  applyTimelineFilter?: boolean;
}

/**
 * Lazy-loaded image component with Intersection Observer
 * Only loads image when it enters viewport
 */
export const LazyImage = ({ src, alt, className = "", placeholder, applyTimelineFilter = false }: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: '200px' // Start loading 200px before image enters viewport
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
  
  const filterClass = applyTimelineFilter ? 'light:[filter:var(--timeline-image-filter)]' : '';

  return (
    <div ref={ref} className="relative overflow-hidden">
      <img
        src={imageSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-50'} ${filterClass} ${className}`}
        loading="lazy"
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
    </div>
  );
};
