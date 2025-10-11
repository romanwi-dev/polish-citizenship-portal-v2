import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded border px-3 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-w-[70px] justify-center shadow-md hover:shadow-lg",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-primary/30 hover:shadow-primary/50",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-secondary/30 hover:shadow-secondary/50",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-destructive/30 hover:shadow-destructive/50",
        outline: "text-foreground shadow-foreground/10 hover:shadow-foreground/20",
        standard: "border-transparent bg-muted text-muted-foreground hover:bg-muted/80 shadow-muted/30 hover:shadow-muted/50",
        expedited: "border-transparent bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 shadow-blue-500/30 hover:shadow-blue-500/50",
        vip: "border-transparent bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 shadow-amber-500/30 hover:shadow-amber-500/50",
        vipPlus: "border-transparent bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 shadow-purple-500/30 hover:shadow-purple-500/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
