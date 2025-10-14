import * as React from "react";

import { cn } from "@/lib/utils";

type ColorScheme = 'children' | 'applicant' | 'parents' | 'grandparents' | 'ggp' | 'poa' | 'citizenship' | 'civil-reg';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  colorScheme?: ColorScheme;
}

const colorSchemes = {
  children: {
    bg: '',
    border: 'border-cyan-300/30 dark:border-cyan-500/30',
    glow: 'rgba(103,232,249,0.25)',
    glowHover: 'rgba(103,232,249,0.4)',
    glowFocus: 'rgba(103,232,249,0.5)',
  },
  applicant: {
    bg: '',
    border: 'border-blue-200/30 dark:border-blue-800/30',
    glow: 'hsla(221, 83%, 53%, 0.15)',
    glowHover: 'hsla(221, 83%, 53%, 0.3)',
    glowFocus: 'hsla(221, 83%, 53%, 0.4)',
  },
  parents: {
    bg: '',
    border: 'border-teal-400/30 dark:border-teal-600/30',
    glow: 'rgba(20,184,166,0.25)',
    glowHover: 'rgba(20,184,166,0.4)',
    glowFocus: 'rgba(20,184,166,0.5)',
  },
  grandparents: {
    bg: '',
    border: 'border-red-400/30 dark:border-red-600/30',
    glow: 'rgba(239,68,68,0.25)',
    glowHover: 'rgba(239,68,68,0.4)',
    glowFocus: 'rgba(239,68,68,0.5)',
  },
  ggp: {
    bg: '',
    border: 'border-gray-200/30 dark:border-gray-600/30',
    glow: 'rgba(209,213,219,0.25)',
    glowHover: 'rgba(209,213,219,0.4)',
    glowFocus: 'rgba(209,213,219,0.5)',
  },
  poa: {
    bg: '',
    border: 'border-gray-300/30 dark:border-gray-500/30',
    glow: 'rgba(156,163,175,0.25)',
    glowHover: 'rgba(156,163,175,0.4)',
    glowFocus: 'rgba(156,163,175,0.5)',
  },
  citizenship: {
    bg: '',
    border: 'border-blue-300/30 dark:border-blue-500/30',
    glow: 'rgba(59,130,246,0.25)',
    glowHover: 'rgba(59,130,246,0.4)',
    glowFocus: 'rgba(59,130,246,0.5)',
  },
  'civil-reg': {
    bg: '',
    border: 'border-emerald-300/30 dark:border-emerald-500/30',
    glow: 'rgba(110,231,183,0.25)',
    glowHover: 'rgba(110,231,183,0.4)',
    glowFocus: 'rgba(110,231,183,0.5)',
  },
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, style, colorScheme = 'applicant', ...props }, ref) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  
  const scheme = colorSchemes[colorScheme];
  
  const glowStyle = {
    boxShadow: isFocused 
      ? `0 0 60px ${scheme.glowFocus}` 
      : isHovered 
        ? `0 0 50px ${scheme.glowHover}`
        : `0 0 30px ${scheme.glow}`,
    transform: (isFocused || isHovered) ? "translateY(-2px)" : "translateY(0)",
    transition: "all 0.3s ease",
    ...style
  };
  
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full max-w-full rounded-none border hover:border-transparent focus:border-transparent px-3 py-2 text-lg font-normal font-input-work ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all backdrop-blur disabled:cursor-not-allowed disabled:opacity-50",
        scheme.bg,
        scheme.border,
        className,
      )}
      style={glowStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
