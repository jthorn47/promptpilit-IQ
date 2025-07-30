import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Eye, EyeOff, Search, X } from "lucide-react";

const haloInputVariants = cva(
  "flex w-full rounded-xl border bg-transparent text-sm transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "glass border-white/8 focus:border-primary/30 focus:shadow-glow focus:ring-2 focus:ring-primary/20",
        outline: "border border-border focus:border-primary focus:ring-2 focus:ring-primary/20",
        filled: "bg-muted border-transparent focus:border-primary focus:ring-2 focus:ring-primary/20",
        ghost: "border-transparent bg-transparent hover:bg-muted/50 focus:bg-muted focus:border-primary",
      },
      size: {
        sm: "h-9 px-3 py-2 text-xs",
        default: "h-11 px-4 py-3",
        lg: "h-12 px-4 py-4 text-base",
      },
      glow: {
        none: "",
        primary: "focus:animate-glow",
        success: "focus:shadow-success-glow focus:border-success/30",
        warning: "focus:shadow-warning-glow focus:border-warning/30",
        error: "focus:shadow-red-500/30 focus:border-red-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: "none",
    },
  }
);

export interface HaloInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof haloInputVariants> {
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  clearable?: boolean;
  onClear?: () => void;
}

const HaloInput = React.forwardRef<HTMLInputElement, HaloInputProps>(
  ({ 
    className, 
    variant, 
    size, 
    glow, 
    type = "text", 
    icon, 
    iconPosition = "left", 
    clearable = false,
    onClear,
    value,
    onChange,
    ...props 
  }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState(value || "");
    
    const isPassword = type === "password";
    const inputType = isPassword ? (isPasswordVisible ? "text" : "password") : type;
    const hasValue = (value !== undefined ? value : internalValue)?.toString().length > 0;
    
    const handleClear = () => {
      if (onClear) {
        onClear();
      }
      if (onChange) {
        const syntheticEvent = {
          target: { value: "" }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(syntheticEvent);
      }
      setInternalValue("");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setInternalValue(e.target.value);
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="relative">
        {icon && iconPosition === "left" && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        
        <input
          type={inputType}
          className={cn(
            haloInputVariants({ variant, size, glow }),
            icon && iconPosition === "left" && "pl-10",
            (icon && iconPosition === "right") || isPassword || clearable ? "pr-10" : "",
            (isPassword && clearable && hasValue) && "pr-16",
            className
          )}
          ref={ref}
          value={value !== undefined ? value : internalValue}
          onChange={value !== undefined ? onChange : handleChange}
          {...props}
        />
        
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {clearable && hasValue && (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setIsPasswordVisible(!isPasswordVisible)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {isPasswordVisible ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          )}
          
          {icon && iconPosition === "right" && !isPassword && !clearable && (
            <div className="text-muted-foreground">
              {icon}
            </div>
          )}
        </div>
      </div>
    );
  }
);
HaloInput.displayName = "HaloInput";

// Search Input Component
export interface HaloSearchProps extends Omit<HaloInputProps, "icon" | "type"> {
  onSearch?: (value: string) => void;
}

const HaloSearch = React.forwardRef<HTMLInputElement, HaloSearchProps>(
  ({ onSearch, onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && onSearch) {
        onSearch(e.currentTarget.value);
      }
      if (onKeyDown) {
        onKeyDown(e);
      }
    };

    return (
      <HaloInput
        ref={ref}
        type="search"
        icon={<Search className="h-4 w-4" />}
        iconPosition="left"
        onKeyDown={handleKeyDown}
        clearable
        {...props}
      />
    );
  }
);
HaloSearch.displayName = "HaloSearch";

export { HaloInput, HaloSearch, haloInputVariants };