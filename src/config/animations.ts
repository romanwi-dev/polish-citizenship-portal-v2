/**
 * Centralized Animation Configuration
 * Ensures consistent animation timing across the application
 */

export const ANIMATION_CONFIG = {
  // Stagger delay for card/item animations (ms) - faster for smoother flow
  STAGGER_DELAY: 40,
  
  // Card flip duration (ms) - faster flip
  FLIP_DURATION: 450,
  
  // Fade-in duration (ms) - snappier
  FADE_DURATION: 200,
  
  // 3D background delay (ms)
  BACKGROUND_3D_DELAY: 2000,
  
  // Transition timing functions - optimized for smoothness
  TIMING_FUNCTIONS: {
    smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)', // smoother easing
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    easeOut: 'cubic-bezier(0.16, 1, 0.3, 1)', // more responsive easeOut
  }
} as const;

/**
 * Get stagger delay for an item at a specific index
 * @param index - The index of the item (0-based)
 * @returns Delay in milliseconds
 */
export const getStaggerDelay = (index: number): number => {
  return index * ANIMATION_CONFIG.STAGGER_DELAY;
};
