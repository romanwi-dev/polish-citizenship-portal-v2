/**
 * Image Optimization Utilities
 * Handles responsive image sizing and format detection
 */

export interface ImageSizeConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

export const defaultImageSizes: ImageSizeConfig = {
  mobile: 640,
  tablet: 1024,
  desktop: 1920,
};

/**
 * Generate responsive image srcset
 */
export const generateSrcSet = (
  baseSrc: string,
  sizes: ImageSizeConfig = defaultImageSizes
): string => {
  const extension = baseSrc.split('.').pop();
  const basePath = baseSrc.replace(`.${extension}`, '');

  return `
    ${basePath}-${sizes.mobile}w.webp ${sizes.mobile}w,
    ${basePath}-${sizes.tablet}w.webp ${sizes.tablet}w,
    ${basePath}-${sizes.desktop}w.webp ${sizes.desktop}w
  `.trim();
};

/**
 * Generate sizes attribute for responsive images
 */
export const generateSizesAttr = (): string => {
  return '(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1920px';
};

/**
 * Check if browser supports WebP
 */
export const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const elem = document.createElement('canvas');
  if (elem.getContext && elem.getContext('2d')) {
    return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }
  return false;
};

/**
 * Get optimized image source based on browser support
 */
export const getOptimizedSrc = (src: string): string => {
  if (!supportsWebP()) return src;
  
  // Convert to WebP if supported
  return src.replace(/\.(png|jpg|jpeg)$/i, '.webp');
};

/**
 * Calculate image dimensions maintaining aspect ratio
 */
export const calculateDimensions = (
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight?: number
): { width: number; height: number } => {
  const aspectRatio = originalWidth / originalHeight;

  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth) {
    width = maxWidth;
    height = width / aspectRatio;
  }

  if (maxHeight && height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
};
