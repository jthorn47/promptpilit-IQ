import React, { memo } from 'react';

interface LoadingStateProps {
  message?: string;
  showSpinner?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'page' | 'component' | 'inline';
}

const LoadingState: React.FC<LoadingStateProps> = memo(({
  message = 'Loading...',
  showSpinner = true,
  size = 'md',
  variant = 'component'
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const variantClasses = {
    page: 'min-h-screen flex items-center justify-center',
    component: 'flex items-center justify-center p-8',
    inline: 'flex items-center gap-2'
  };

  return (
    <div className={variantClasses[variant]}>
      <div className="text-center">
        {showSpinner && (
          <div 
            className={`animate-spin rounded-full border-b-2 border-primary mx-auto mb-4 ${sizeClasses[size]}`}
            aria-label="Loading"
          />
        )}
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
});

LoadingState.displayName = 'LoadingState';

export { LoadingState };