import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-bold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 backdrop-blur-md border border-white/30 bg-white/5 hover:bg-white/10 opacity-50",
  {
    variants: {
      variant: {
        default: "bg-white/5 hover:bg-white/10 border-white/30 opacity-50",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 border-destructive",
        outline: "border-white/30 bg-white/5 hover:bg-white/10 opacity-50",
        secondary: "bg-white/5 hover:bg-white/10 border-white/30 opacity-50",
        ghost: "border-0 bg-transparent hover:bg-white/10 opacity-50",
        link: "border-0 bg-transparent underline-offset-4 hover:underline opacity-100",
      },
      size: {
        default: "h-11 md:h-12 lg:h-14 px-4 md:px-6 lg:px-8 text-sm md:text-base lg:text-lg",
        sm: "h-9 rounded px-3 text-sm",
        lg: "h-12 rounded px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}>
        {typeof children === 'string' ? (
          <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            {children}
          </span>
        ) : children}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
