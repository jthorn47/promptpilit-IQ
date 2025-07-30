import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const haloButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "glass border-0 text-primary-foreground shadow-glass hover:shadow-glow hover:scale-105 active:scale-95 bg-gradient-primary",
        secondary: "glass-strong border-0 bg-secondary-glass text-secondary-foreground shadow-neural hover:shadow-neural hover:scale-105 active:scale-95",
        ghost: "border border-white/8 bg-transparent text-muted-foreground hover:glass hover:text-foreground hover:border-white/15 hover:scale-105 active:scale-95",
        outline: "border border-primary/20 bg-transparent text-primary hover:bg-primary/10 hover:shadow-glow hover:scale-105 active:scale-95",
        destructive: "glass border-0 bg-gradient-to-r from-destructive to-red-600 text-destructive-foreground shadow-glass hover:shadow-glow hover:scale-105 active:scale-95",
        link: "text-primary underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 px-4 py-2 text-xs",
        lg: "h-12 px-8 py-4 text-base",
        xl: "h-14 px-10 py-5 text-lg",
        icon: "h-11 w-11 p-0",
        "icon-sm": "h-9 w-9 p-0",
        "icon-lg": "h-12 w-12 p-0",
      },
      glow: {
        none: "",
        primary: "hover:animate-glow",
        success: "hover:shadow-success-glow",
        warning: "hover:shadow-warning-glow",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: "none",
    },
  }
);

export interface HaloButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof haloButtonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const HaloButton = React.forwardRef<HTMLButtonElement, HaloButtonProps>(
  ({ className, variant, size, glow, asChild = false, loading = false, loadingText, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    return (
      <Comp
        className={cn(haloButtonVariants({ variant, size, glow, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {loading ? loadingText || "Loading..." : children}
        
        {/* Magnetic hover effect */}
        {!loading && (
          <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 hover:opacity-100 pointer-events-none">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700" />
          </div>
        )}
      </Comp>
    );
  }
);
HaloButton.displayName = "HaloButton";

export { HaloButton, haloButtonVariants };