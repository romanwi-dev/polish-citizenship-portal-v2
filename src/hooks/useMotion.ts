import { useEffect, useState } from 'react';
import type { motion as MotionType } from 'framer-motion';

type MotionModule = typeof MotionType;

/**
 * Dynamically loads framer-motion to reduce initial bundle size
 * Falls back to regular div during SSR or initial render
 */
export const useMotion = () => {
  const [motion, setMotion] = useState<MotionModule | null>(null);

  useEffect(() => {
    // Lazy load framer-motion after component mounts
    import('framer-motion').then((mod) => {
      setMotion(mod.motion);
    });
  }, []);

  return motion;
};
