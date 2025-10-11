import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded border px-3 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-w-[70px] justify-center",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        standard: "border-transparent bg-muted text-muted-foreground hover:bg-muted/80",
        expedited: "border-transparent bg-blue-500/20 text-blue-400 hover:bg-blue-500/30",
        vip: "border-transparent bg-amber-500/20 text-amber-400 hover:bg-amber-500/30",
        vipPlus: "border-transparent bg-purple-500/20 text-purple-400 hover:bg-purple-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  
  const glowStyle = {
    boxShadow: isHovered ? "0 0 25px hsla(221, 83%, 53%, 0.4)" : "0 0 15px hsla(221, 83%, 53%, 0.2)",
    transition: "all 0.3s ease"
  };
  
  return (
    <div 
      className={cn(badgeVariants({ variant }), className)} 
      style={glowStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props} 
    />
  );
}

export { Badge, badgeVariants };
