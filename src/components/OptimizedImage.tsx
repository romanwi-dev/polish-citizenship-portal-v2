import { useState, useEffect, useRef } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  lazy?: boolean;
  priority?: boolean;
  placeholder?: 'blur' | 'none';
  sizes?: string;
}

/**
 * OptimizedImage Component
 * 
 * Features:
 * - Automatic lazy loading with Intersection Observer
 * - WebP format with fallback
 * - Blur-up loading placeholder
 * - Prevents Cumulative Layout Shift (CLS)
 * - Priority loading for above-fold images
 */
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  lazy = true,
  priority = false,
  placeholder = 'blur',
  sizes,
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazy || priority);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!lazy || priority) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Load images 50px before they enter viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [lazy, priority]);

  // Generate WebP source
  const webpSrc = src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
  const hasWebP = src !== webpSrc;

  const aspectRatio = width && height ? (height / width) * 100 : undefined;

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        paddingBottom: aspectRatio ? `${aspectRatio}%` : undefined,
        width: width ? `${width}px` : '100%',
        maxWidth: '100%',
      }}
    >
      {placeholder === 'blur' && !isLoaded && (
        <div
          className="absolute inset-0 bg-muted animate-pulse"
          style={{
            backdropFilter: 'blur(10px)',
          }}
        />
      )}

      {isInView && (
        <picture>
          {hasWebP && (
            <source srcSet={webpSrc} type="image/webp" sizes={sizes} />
          )}
          <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={priority ? 'eager' : 'lazy'}
            decoding={priority ? 'sync' : 'async'}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsLoaded(true)}
            style={{
              objectFit: 'cover',
            }}
          />
        </picture>
      )}
    </div>
  );
};
