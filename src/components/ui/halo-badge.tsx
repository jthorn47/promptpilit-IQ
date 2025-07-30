import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const haloBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "glass border-white/20 text-foreground shadow-glass",
        primary: "glass border-primary/30 bg-primary/10 text-primary shadow-glow",
        secondary: "glass border-white/10 bg-secondary/20 text-secondary-foreground",
        success: "glass border-success/30 bg-success/10 text-success shadow-success-glow",
        warning: "glass border-warning/30 bg-warning/10 text-warning shadow-warning-glow",
        destructive: "glass border-destructive/30 bg-destructive/10 text-destructive",
        outline: "border border-border bg-transparent text-foreground",
        ghost: "border-transparent bg-transparent text-muted-foreground hover:bg-muted/50",
        neural: "glass border-primary/20 bg-neural text-primary animate-halo-pulse",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-3 py-1 text-xs",
        lg: "px-4 py-2 text-sm",
      },
      glow: {
        none: "",
        primary: "shadow-glow",
        success: "shadow-success-glow",
        warning: "shadow-warning-glow",
        pulse: "animate-halo-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: "none",
    },
  }
);

export interface HaloBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof haloBadgeVariants> {
  pulse?: boolean;
  icon?: React.ReactNode;
  dot?: boolean;
}

function HaloBadge({ 
  className, 
  variant, 
  size, 
  glow, 
  pulse, 
  icon, 
  dot, 
  children, 
  ...props 
}: HaloBadgeProps) {
  return (
    <div 
      className={cn(
        haloBadgeVariants({ variant, size, glow }), 
        pulse && "animate-halo-pulse",
        className
      )} 
      {...props}
    >
      {dot && (
        <div className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current animate-halo-pulse" />
      )}
      {icon && (
        <div className="mr-1.5 [&>svg]:h-3 [&>svg]:w-3">
          {icon}
        </div>
      )}
      {children}
    </div>
  );
}

// Status Badge variants for common use cases
const StatusBadge = ({ status, ...props }: Omit<HaloBadgeProps, "variant"> & { status: "online" | "offline" | "busy" | "away" | "active" | "inactive" | "pending" | "completed" | "failed" }) => {
  const statusConfig = {
    online: { variant: "success" as const, dot: true, children: "Online" },
    offline: { variant: "outline" as const, dot: true, children: "Offline" },
    busy: { variant: "destructive" as const, dot: true, children: "Busy" },
    away: { variant: "warning" as const, dot: true, children: "Away" },
    active: { variant: "success" as const, children: "Active" },
    inactive: { variant: "outline" as const, children: "Inactive" },
    pending: { variant: "warning" as const, pulse: true, children: "Pending" },
    completed: { variant: "success" as const, children: "Completed" },
    failed: { variant: "destructive" as const, children: "Failed" },
  };

  const config = statusConfig[status];
  
  return <HaloBadge {...config} {...props} />;
};

// Notification Badge for counts
const NotificationBadge = ({ count, max = 99, className, ...props }: Omit<HaloBadgeProps, "variant" | "size"> & { count: number; max?: number }) => {
  const displayCount = count > max ? `${max}+` : count.toString();
  
  if (count === 0) return null;
  
  return (
    <HaloBadge 
      variant="destructive"
      size="sm"
      className={cn(
        "min-w-[1.25rem] h-5 rounded-full px-1.5 flex items-center justify-center font-bold",
        count > 99 && "px-1",
        className
      )}
      {...props}
    >
      {displayCount}
    </HaloBadge>
  );
};

export { HaloBadge, StatusBadge, NotificationBadge, haloBadgeVariants };