import { useEffect, useState } from 'react';
import type { motion as MotionType } from 'framer-motion';

type MotionModule = typeof MotionType;

/**
 * Dynamically loads framer-motion to reduce initial bundle size
 * Returns motion components or fallback HTML elements
 */
export const useMotion = () => {
  const [motion, setMotion] = useState<MotionModule | null>(null);

  useEffect(() => {
    import('framer-motion').then((mod) => {
      setMotion(mod.motion);
    });
  }, []);

  // Return motion components or fallback to regular HTML elements
  return motion ? {
    div: motion.div,
    section: motion.section,
    span: motion.span,
    button: motion.button,
    p: motion.p,
    h1: motion.h1,
    h2: motion.h2,
    h3: motion.h3,
    li: motion.li,
    ul: motion.ul,
    path: motion.path,
  } : {
    div: 'div' as any,
    section: 'section' as any,
    span: 'span' as any,
    button: 'button' as any,
    p: 'p' as any,
    h1: 'h1' as any,
    h2: 'h2' as any,
    h3: 'h3' as any,
    li: 'li' as any,
    ul: 'ul' as any,
    path: 'path' as any,
  };
};
