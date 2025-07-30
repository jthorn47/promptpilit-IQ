import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const haloCardVariants = cva(
  "rounded-2xl transition-all duration-500",
  {
    variants: {
      variant: {
        default: "glass-strong border border-white/10 shadow-neural",
        glass: "glass border border-white/8 shadow-glass",
        solid: "bg-card border border-border shadow-sm",
        gradient: "bg-gradient-primary border-0 text-primary-foreground shadow-glow",
        neural: "glass-strong border border-primary/20 shadow-neural bg-neural",
      },
      hover: {
        none: "",
        lift: "hover:shadow-glow hover:scale-[1.02] hover:border-primary/20",
        glow: "hover:shadow-glow hover:border-primary/30",
        magnetic: "hover:shadow-magnetic hover:scale-[1.02] hover:-translate-y-1",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      hover: "none",
      size: "default",
    },
  }
);

export interface HaloCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof haloCardVariants> {
  pulse?: boolean;
}

const HaloCard = React.forwardRef<HTMLDivElement, HaloCardProps>(
  ({ className, variant, hover, size, pulse, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          haloCardVariants({ variant, hover, size }),
          pulse && "animate-halo-pulse",
          className
        )}
        {...props}
      >
        {children}
        
        {/* Ambient background effect */}
        {variant === "neural" && (
          <div className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none">
            <div className="absolute top-4 left-4 w-12 h-12 bg-primary/20 rounded-full blur-xl animate-float" />
            <div className="absolute bottom-8 right-8 w-8 h-8 bg-primary/10 rounded-full blur-lg animate-float" style={{ animationDelay: "1s" }} />
          </div>
        )}
      </div>
    );
  }
);
HaloCard.displayName = "HaloCard";

const HaloCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-6", className)}
    {...props}
  />
));
HaloCardHeader.displayName = "HaloCardHeader";

const HaloCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-heading text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
));
HaloCardTitle.displayName = "HaloCardTitle";

const HaloCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-body text-sm text-muted-foreground", className)}
    {...props}
  />
));
HaloCardDescription.displayName = "HaloCardDescription";

const HaloCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
));
HaloCardContent.displayName = "HaloCardContent";

const HaloCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-6", className)}
    {...props}
  />
));
HaloCardFooter.displayName = "HaloCardFooter";

export {
  HaloCard,
  HaloCardHeader,
  HaloCardFooter,
  HaloCardTitle,
  HaloCardDescription,
  HaloCardContent,
  haloCardVariants,
};