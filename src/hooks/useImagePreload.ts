import { useEffect } from 'react';

/**
 * Preload critical images to improve LCP
 * Use for above-fold images that are critical to user experience
 */
export const useImagePreload = (imageSrc: string, priority: boolean = true) => {
  useEffect(() => {
    if (!priority) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imageSrc;
    
    // Preload WebP version if available
    const webpSrc = imageSrc.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    if (webpSrc !== imageSrc) {
      link.href = webpSrc;
      link.type = 'image/webp';
    }

    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, [imageSrc, priority]);
};
