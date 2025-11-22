/**
 * Image optimization utilities for lazy loading and performance
 */

/**
 * Lazy load images with intersection observer
 */
export function createLazyImageLoader(
  img: HTMLImageElement,
  src: string,
  options?: { root?: Element | null; rootMargin?: string; threshold?: number }
): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          img.src = src;
          observer.unobserve(img);
        }
      });
    },
    {
      root: options?.root || null,
      rootMargin: options?.rootMargin || '50px',
      threshold: options?.threshold || 0.01,
    }
  );

  observer.observe(img);

  return () => observer.disconnect();
}

/**
 * Preload critical images
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    link.onload = () => resolve();
    link.onerror = reject;
    document.head.appendChild(link);
  });
}

/**
 * Get optimized image URL with WebP support
 */
export function getOptimizedImageUrl(
  src: string,
  options?: { width?: number; quality?: number; format?: 'webp' | 'avif' | 'jpg' }
): string {
  // If using an image CDN, add optimization parameters
  // For now, return original src
  // In production, you might want to use a service like Cloudinary, Imgix, etc.
  return src;
}

/**
 * Lazy load component for React
 * Note: Import React in your component file when using this hook
 */
import { useState, useEffect, useRef } from 'react';

export function useLazyImage(src: string | null | undefined) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!src) {
      setImageSrc(null);
      setIsLoading(false);
      return;
    }

    const img = imgRef.current || document.createElement('img');
    if (!imgRef.current) {
      imgRef.current = img;
    }

    const cleanup = createLazyImageLoader(img, src);

    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
      setError(null);
    };

    img.onerror = () => {
      setError(new Error('Failed to load image'));
      setIsLoading(false);
    };

    return cleanup;
  }, [src]);

  return { imageSrc, isLoading, error, imgRef };
}
