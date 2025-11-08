import * as React from "react";

import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  noMobileCaps?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, style, noMobileCaps = false, ...props }, ref) => {
    const glowStyle = {
      transition: "all 0.3s ease",
      ...style
    };
    
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 md:h-12 w-full min-w-0 rounded-md border-2 border-input bg-background px-3 py-2 text-base md:text-lg font-normal font-input-work ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          !noMobileCaps && "uppercase md:normal-case",
          className,
        )}
        style={glowStyle}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
