import { FC, ReactNode, memo } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

/**
 * Optimized loading fallback with skeleton effect
 */
export const GlobalLoadingFallback: FC<LoadingFallbackProps> = memo(({ 
  title = "Loading...", 
  subtitle,
  className = "min-h-screen"
}) => (
  <div className={`flex items-center justify-center ${className} bg-background`}>
    <div className="flex flex-col items-center gap-4 p-8">
      <div className="relative">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="absolute inset-0 h-8 w-8 rounded-full border-2 border-primary/20 animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </div>
  </div>
));

/**
 * Compact loading for smaller components
 */
export const CompactLoadingFallback: FC<{ text?: string }> = memo(({ 
  text = "Loading..." 
}) => (
  <div className="flex items-center justify-center p-4">
    <div className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin text-primary" />
      <span className="text-sm text-muted-foreground">{text}</span>
    </div>
  </div>
));

/**
 * Skeleton loader for better perceived performance
 */
export const SkeletonLoader: FC<{ 
  lines?: number; 
  className?: string;
}> = memo(({ lines = 3, className = "" }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: lines }, (_, i) => (
      <div key={i} className="h-4 bg-muted rounded animate-pulse" style={{
        width: `${Math.random() * 40 + 60}%`
      }} />
    ))}
  </div>
));

/**
 * Card skeleton for dashboard components
 */
export const CardSkeleton: FC<{ className?: string }> = memo(({ className = "" }) => (
  <div className={`p-6 border rounded-lg bg-card ${className}`}>
    <div className="space-y-4">
      <div className="h-6 bg-muted rounded animate-pulse w-1/3" />
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-4/5" />
        <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
      </div>
    </div>
  </div>
));