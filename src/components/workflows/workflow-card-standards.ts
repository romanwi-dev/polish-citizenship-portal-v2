/**
 * Workflow Card Standards
 * Defines the exact specifications for all workflow cards across the application
 * Standard: Translation Workflow Cards
 */

export const WORKFLOW_CARD_STANDARDS = {
  // Card dimensions
  cardHeight: '520px',
  
  // Layout proportions (must match Translation Workflow)
  layout: {
    cardWidth: 'md:w-[42%]',      // Card container
    timelineWidth: 'md:w-[16%]',   // Timeline dot container
    emptyWidth: 'md:w-[42%]'       // Empty space for alternating layout
  },
  
  // Spacing
  spacing: {
    headerBottom: 'mb-24',  // Space below workflow title
    cardBottom: 'mb-16'     // Space between cards
  },
  
  // Icon sizes
  icons: {
    frontIcon: 'w-16 h-16',
    backIcon: 'w-12 h-12',
    iconContainer: 'w-full h-32'
  },
  
  // Animations
  animations: {
    cardInitial: { opacity: 0, y: 50 },
    cardAnimate: { opacity: 1, y: 0 },
    duration: 0.6,
    stagger: 0.1,
    viewport: { once: true, margin: '-100px' }
  },
  
  // Typography
  typography: {
    stepNumber: 'text-5xl font-heading font-black',
    title: 'text-2xl md:text-3xl font-heading font-black tracking-tight',
    description: 'text-xs text-muted-foreground/70 leading-relaxed'
  },
  
  // Timeline dot styling
  timelineDot: {
    base: 'w-8 h-8 rounded-full bg-primary border-4 border-background',
    shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    transition: 'transition-all duration-300'
  }
} as const;
