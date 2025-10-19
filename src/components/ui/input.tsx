import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, style, ...props }, ref) => {
    const [isHovered, setIsHovered] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    
    const glowStyle = {
      boxShadow: isFocused 
        ? "0 0 20px hsla(var(--primary) / 0.2)" 
        : isHovered 
          ? "0 0 15px hsla(var(--primary) / 0.15)"
          : "none",
      transition: "all 0.3s ease",
      ...style
    };
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 md:h-12 w-full min-w-0 rounded-md border-2 border-input bg-background px-3 py-2 text-base md:text-lg font-normal font-input-work ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
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
  },
);
Input.displayName = "Input";

export { Input };
