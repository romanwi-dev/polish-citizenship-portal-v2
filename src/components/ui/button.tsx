import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 active:opacity-80 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "backdrop-blur-md border dark:border-white/30 dark:bg-white/5 dark:hover:bg-white/10 dark:opacity-50 light:border-primary/30 light:bg-primary/10 light:hover:bg-primary/15 light:opacity-100",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive",
        outline: "border dark:border-white/30 dark:bg-white/5 dark:hover:bg-white/10 dark:opacity-50 light:border-primary/30 light:bg-transparent light:hover:bg-primary/10 light:opacity-100",
        secondary: "backdrop-blur-md border dark:border-white/30 dark:bg-white/5 dark:hover:bg-white/10 dark:opacity-50 light:border-secondary/30 light:bg-secondary/10 light:hover:bg-secondary/15 light:opacity-100",
        ghost: "border-0 bg-transparent dark:hover:bg-white/10 dark:opacity-50 light:hover:bg-primary/10 light:opacity-100",
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
