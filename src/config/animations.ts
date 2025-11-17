/**
 * Centralized Animation Configuration
 * Ensures consistent animation timing across the application
 */

export const ANIMATION_CONFIG = {
  // Stagger delay for card/item animations (ms)
  STAGGER_DELAY: 100,
  
  // Card flip duration (ms)
  FLIP_DURATION: 700,
  
  // Fade-in duration (ms)
  FADE_DURATION: 300,
  
  // 3D background delay (ms)
  BACKGROUND_3D_DELAY: 2000,
  
  // Transition timing functions
  TIMING_FUNCTIONS: {
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
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
