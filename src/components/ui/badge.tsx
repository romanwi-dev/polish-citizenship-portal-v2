import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded border px-3 py-0.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 min-w-[70px] justify-center shadow-lg hover:shadow-xl",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 shadow-primary/40 hover:shadow-primary/60",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-secondary/40 hover:shadow-secondary/60",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 shadow-destructive/40 hover:shadow-destructive/60",
        outline: "text-foreground shadow-foreground/20 hover:shadow-foreground/40",
        standard: "border-transparent bg-muted text-muted-foreground hover:bg-muted/80 shadow-muted/40 hover:shadow-muted/60",
        expedited: "border-transparent bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 shadow-blue-500/40 hover:shadow-blue-500/60",
        vip: "border-transparent bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 shadow-amber-500/40 hover:shadow-amber-500/60",
        vipPlus: "border-transparent bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 shadow-purple-500/40 hover:shadow-purple-500/60",
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
