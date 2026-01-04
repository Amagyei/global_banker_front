import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-mono font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 uppercase tracking-wider",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:shadow-neon hover:bg-primary/90 border border-primary/50",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 border border-destructive/50 hover:shadow-[0_0_20px_hsl(0_100%_50%/0.5)]",
        outline:
          "border border-primary/50 bg-transparent text-primary hover:bg-primary/10 hover:shadow-neon",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/90 border border-secondary/50 hover:shadow-cyan",
        success:
          "bg-success text-success-foreground hover:bg-success/90 border border-success/50 hover:shadow-neon",
        ghost:
          "text-foreground hover:bg-primary/10 hover:text-primary",
        link:
          "text-primary underline-offset-4 hover:underline hover:text-glow-sm",
        cyber:
          "bg-gradient-primary text-primary-foreground hover:shadow-neon border-0 relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:-translate-x-full hover:before:translate-x-full before:transition-transform before:duration-500",
        terminal:
          "bg-muted text-primary border border-primary/30 font-mono hover:border-primary hover:shadow-neon",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-sm px-3",
        lg: "h-11 rounded-sm px-8",
        icon: "h-10 w-10",
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
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
