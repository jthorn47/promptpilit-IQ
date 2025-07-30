import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const haloProgressVariants = cva(
  "relative h-2 w-full overflow-hidden rounded-full",
  {
    variants: {
      variant: {
        default: "glass bg-white/5",
        outline: "border border-border bg-transparent",
        filled: "bg-muted",
      },
      size: {
        sm: "h-1",
        default: "h-2",
        lg: "h-3",
        xl: "h-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const haloProgressFillVariants = cva(
  "h-full w-full flex-1 rounded-full transition-all duration-500 ease-out",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary shadow-glow",
        success: "bg-gradient-to-r from-success to-green-400 shadow-success-glow",
        warning: "bg-gradient-to-r from-warning to-yellow-400 shadow-warning-glow",
        destructive: "bg-gradient-to-r from-destructive to-red-400",
        neural: "bg-gradient-primary animate-halo-pulse",
      },
      glow: {
        none: "",
        primary: "shadow-glow",
        success: "shadow-success-glow",
        warning: "shadow-warning-glow",
        pulse: "animate-glow",
      },
    },
    defaultVariants: {
      variant: "default",
      glow: "none",
    },
  }
);

export interface HaloProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof haloProgressVariants> {
  value?: number;
  max?: number;
  fillVariant?: VariantProps<typeof haloProgressFillVariants>["variant"];
  glow?: VariantProps<typeof haloProgressFillVariants>["glow"];
  showValue?: boolean;
  animated?: boolean;
  pulse?: boolean;
}

const HaloProgress = React.forwardRef<HTMLDivElement, HaloProgressProps>(
  ({ 
    className, 
    variant, 
    size, 
    value = 0, 
    max = 100, 
    fillVariant = "default",
    glow = "none",
    showValue = false,
    animated = true,
    pulse = false,
    ...props 
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    
    return (
      <div className="relative">
        <div
          ref={ref}
          className={cn(haloProgressVariants({ variant, size }), className)}
          {...props}
        >
          <div
            className={cn(
              haloProgressFillVariants({ variant: fillVariant, glow }),
              pulse && "animate-halo-pulse",
              "transform-gpu origin-left"
            )}
            style={{
              transform: `scaleX(${percentage / 100})`,
              transition: animated ? "transform 500ms ease-out" : "none",
            }}
          />
          
          {/* Shimmer effect for loading states */}
          {animated && percentage < 100 && (
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          )}
        </div>
        
        {/* Value display */}
        {showValue && (
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>{value}</span>
            <span>{max}</span>
          </div>
        )}
      </div>
    );
  }
);
HaloProgress.displayName = "HaloProgress";

// Circular Progress Component
export interface HaloCircularProgressProps 
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  variant?: "default" | "success" | "warning" | "destructive";
  glow?: boolean;
  pulse?: boolean;
}

const HaloCircularProgress = React.forwardRef<HTMLDivElement, HaloCircularProgressProps>(
  ({
    className,
    value = 0,
    max = 100,
    size = 120,
    strokeWidth = 8,
    showValue = true,
    variant = "default",
    glow = false,
    pulse = false,
    ...props
  }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    const colors = {
      default: "stroke-primary",
      success: "stroke-success",
      warning: "stroke-warning",
      destructive: "stroke-destructive",
    };

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          className={cn(
            "transform -rotate-90 transition-all duration-500",
            glow && "drop-shadow-glow",
            pulse && "animate-halo-pulse"
          )}
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="none"
            className="text-muted/20"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              colors[variant],
              "transition-all duration-500 ease-out"
            )}
            style={{
              filter: glow ? `drop-shadow(0 0 10px hsl(var(--primary)))` : undefined,
            }}
          />
        </svg>
        
        {/* Center content */}
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-semibold">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
      </div>
    );
  }
);
HaloCircularProgress.displayName = "HaloCircularProgress";

export { HaloProgress, HaloCircularProgress, haloProgressVariants };