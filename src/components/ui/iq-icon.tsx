
import React from 'react';
import { cn } from '@/lib/utils';

interface IQIconProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'muted' | 'accent';
  className?: string;
}

export const IQIcon: React.FC<IQIconProps> = ({ 
  size = 'md', 
  variant = 'default',
  className 
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  const variantClasses = {
    default: 'text-muted-foreground hover:text-primary',
    muted: 'text-muted-foreground/60 hover:text-muted-foreground',
    accent: 'text-primary hover:text-primary/80'
  };

  return (
    <div 
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-all duration-200 cursor-help select-none',
        'hover:scale-105 focus:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/20',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="img"
      aria-label="HaaLO IQ Help"
    >
      <svg
        viewBox="0 0 16 16"
        fill="currentColor"
        className="w-full h-full"
      >
        {/* IQ Symbol Design */}
        <circle cx="8" cy="8" r="7.5" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
        <text 
          x="8" 
          y="11" 
          fontSize="8" 
          fontWeight="600" 
          textAnchor="middle" 
          fontFamily="Inter, system-ui, sans-serif"
        >
          IQ
        </text>
      </svg>
    </div>
  );
};
