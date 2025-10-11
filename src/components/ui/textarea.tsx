import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, style, ...props }, ref) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState(false);
  
  const glowStyle = {
    boxShadow: isFocused 
      ? "0 0 60px hsla(221, 83%, 53%, 0.4)" 
      : isHovered 
        ? "0 0 50px hsla(221, 83%, 53%, 0.3)"
        : "0 0 30px hsla(221, 83%, 53%, 0.15)",
    transition: "all 0.3s ease",
    ...style
  };
  
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full max-w-full rounded-none border-2 border-border/50 bg-blue-50/45 dark:bg-blue-950/40 px-3 py-2 text-lg font-normal font-input-work ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all backdrop-blur disabled:cursor-not-allowed disabled:opacity-50",
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
