import { useState, useEffect } from 'react';

export type DeviceTier = 'mobile' | 'low-power' | 'high-power';

/**
 * Detects device tier based on multiple factors:
 * - Screen width (mobile detection)
 * - WebGL capabilities (GPU power)
 * - Network connection speed
 * - Device memory (if available)
 */
export const useDeviceTier = (): DeviceTier => {
  const [tier, setTier] = useState<DeviceTier>('high-power');

  useEffect(() => {
    const detectTier = (): DeviceTier => {
      // Mobile detection (< 768px)
      const isMobile = window.innerWidth < 768;
      if (isMobile) return 'mobile';

      // Tablet/small desktop detection
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

      // Check WebGL capabilities
      const hasGoodGPU = checkWebGLCapabilities();

      // Check device memory (if available)
      const hasLowMemory = checkDeviceMemory();

      // Check network speed
      const hasSlowConnection = checkNetworkSpeed();

      // Determine tier
      if (isTablet && (!hasGoodGPU || hasLowMemory || hasSlowConnection)) {
        return 'low-power';
      }

      if (!hasGoodGPU || hasLowMemory) {
        return 'low-power';
      }

      return 'high-power';
    };

    setTier(detectTier());

    // Re-check on resize
    const handleResize = () => {
      setTier(detectTier());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return tier;
};

/**
 * Check WebGL capabilities to determine GPU power
 */
const checkWebGLCapabilities = (): boolean => {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) return false;

    // Check max texture size (good GPUs support 8192+)
    const maxTextureSize = (gl as WebGLRenderingContext).getParameter(
      (gl as WebGLRenderingContext).MAX_TEXTURE_SIZE
    );

    // Good GPU threshold: 4096+ texture size
    return maxTextureSize >= 4096;
  } catch {
    return false;
  }
};

/**
 * Check device memory (if available)
 * Low memory devices: < 4GB
 */
const checkDeviceMemory = (): boolean => {
  // @ts-ignore - deviceMemory is not in TypeScript types yet
  const deviceMemory = navigator.deviceMemory;
  
  if (typeof deviceMemory === 'number') {
    // Less than 4GB is considered low memory
    return deviceMemory < 4;
  }

  // If not available, assume not low memory
  return false;
};

/**
 * Check network speed
 * Returns true if connection is slow (2g/3g)
 */
const checkNetworkSpeed = (): boolean => {
  // @ts-ignore - connection is not in all TypeScript types
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (connection && connection.effectiveType) {
    const slowTypes = ['slow-2g', '2g', '3g'];
    return slowTypes.includes(connection.effectiveType);
  }

  // If not available, assume good connection
  return false;
};
