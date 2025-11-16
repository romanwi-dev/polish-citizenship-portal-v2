/**
 * WORKFLOW CARD STANDARDS - LOCKED CONFIGURATION
 * 
 * This configuration defines the exact specifications for ALL workflow cards
 * across the entire portal. DO NOT modify without explicit approval.
 * 
 * Applied to:
 * - Complete Legal Process Timeline
 * - How to Become Our Client  
 * - Documents Workflow (AI workflow)
 * - All Case Workflows (Translations, Archives, Citizenship, Civil Acts, Passport, Services)
 */

export const WORKFLOW_CARD_STANDARDS = {
  // Card dimensions
  cardHeight: '600px',
  
  // Layout proportions (MUST MATCH across all workflows)
  layout: {
    cardWidth: 'md:w-[42%]',      // Card container
    timelineWidth: 'md:w-[16%]',   // Timeline dot container
    emptyWidth: 'md:w-[42%]'       // Empty space for alternating layout
  },
  
  // Timeline dot specification (CIRCLED NUMBERS)
  timelineDot: {
    container: 'w-16 h-16 rounded-full bg-gradient-to-r from-primary to-secondary border-2 border-primary',
    shadow: 'shadow-[0_0_30px_rgba(59,130,246,0.5)]',
    layout: 'flex items-center justify-center',
    numberStyle: 'text-white font-heading font-bold text-3xl'
  },
  
  // Card number display rules
  numberDisplay: {
    showOnCard: false,           // NO number badges on cards
    showOnTimeline: true,        // Numbers ONLY on timeline dots
    format: 'circled'            // Circled format only
  },
  
  // Spacing
  spacing: {
    headerBottom: 'mb-24',       // Space below workflow title
    cardBottom: 'mb-16'          // Space between cards
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
  }
} as const;
