import { Button } from "@/components/ui/button";
import { ArrowRight, LucideIcon } from "lucide-react";

interface MainCTAProps {
  /**
   * The text to display on the button
   */
  children: React.ReactNode;
  
  /**
   * Click handler for the button
   */
  onClick?: () => void;
  
  /**
   * Accessibility label
   */
  ariaLabel: string;
  
  /**
   * Optional icon to display (pass null or undefined to hide icon)
   */
  icon?: LucideIcon | null;
  
  /**
   * Optional animation delay (e.g., '600ms')
   */
  animationDelay?: string;
  
  /**
   * Optional additional wrapper classes (for spacing like mt-40 mb-20)
   */
  wrapperClassName?: string;
}

/**
 * MainCTA - The standardized primary call-to-action button component
 * 
 * This component enforces the MAIN CTA standards documented in docs/MAIN_CTA_STANDARDS.md
 * 
 * @see docs/MAIN_CTA_STANDARDS.md
 * 
 * @example
 * ```tsx
 * <MainCTA
 *   ariaLabel="Take the Polish Citizenship Test to check your eligibility"
 *   onClick={() => window.open('https://example.com', '_blank')}
 * >
 *   Take Polish Citizenship Test
 * </MainCTA>
 * ```
 */
export function MainCTA({
  children,
  onClick,
  ariaLabel,
  icon: Icon,
  animationDelay,
  wrapperClassName = "mt-40 mb-20"
}: MainCTAProps) {
  return (
    <div 
      className={`flex justify-center animate-fade-in ${wrapperClassName}`}
      style={animationDelay ? { animationDelay } : undefined}
    >
      <Button 
        size="lg" 
        className="text-xl md:text-2xl font-bold px-12 py-6 md:px-20 md:py-6 h-auto min-h-[64px] md:min-h-[72px] w-[500px] rounded-lg bg-red-700 dark:bg-red-900/60 hover:bg-red-800 dark:hover:bg-red-900/70 text-white shadow-[0_0_40px_rgba(185,28,28,0.6)] dark:shadow-[0_0_40px_rgba(127,29,29,0.6)] hover:shadow-[0_0_60px_rgba(185,28,28,0.8)] dark:hover:shadow-[0_0_60px_rgba(127,29,29,0.8)] group relative overflow-hidden backdrop-blur-md border-2 border-red-600 dark:border-red-800/40 hover:border-red-500 dark:hover:border-red-700/60 transition-all duration-300 hover:scale-105 animate-pulse"
        onClick={onClick}
        aria-label={ariaLabel}
      >
        <span className="relative z-10 flex items-center gap-3">
          {children}
          {Icon && <Icon className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Button>
    </div>
  );
}
