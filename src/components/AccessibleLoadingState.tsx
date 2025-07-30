import React from 'react';
import { Loader2 } from 'lucide-react';

interface AccessibleLoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showSpinner?: boolean;
  className?: string;
  role?: 'status' | 'alert';
}

export const AccessibleLoadingState: React.FC<AccessibleLoadingStateProps> = ({
  message = 'Loading...',
  size = 'md',
  showSpinner = true,
  className = '',
  role = 'status'
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  return (
    <div 
      className={`flex items-center justify-center gap-2 ${className}`}
      role={role}
      aria-live="polite"
      aria-label={message}
    >
      {showSpinner && (
        <Loader2 
          className={`${sizeClasses[size]} animate-spin`} 
          aria-hidden="true"
        />
      )}
      <span className={`${textSizeClasses[size]} text-muted-foreground`}>
        {message}
      </span>
      <span className="sr-only">Please wait</span>
    </div>
  );
};

// Skeleton loading component for better accessibility
export const AccessibleSkeleton: React.FC<{
  className?: string;
  children?: React.ReactNode;
  'aria-label'?: string;
}> = ({ 
  className = '', 
  children,
  'aria-label': ariaLabel = 'Content loading'
}) => {
  return (
    <div 
      className={`animate-pulse bg-muted rounded ${className}`}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      {children && (
        <div className="sr-only">
          {children}
        </div>
      )}
    </div>
  );
};

// Progress indicator for form steps or loading progress
interface AccessibleProgressProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export const AccessibleProgress: React.FC<AccessibleProgressProps> = ({
  value,
  max = 100,
  label = 'Progress',
  showPercentage = true,
  className = ''
}) => {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        {showPercentage && (
          <span className="text-sm text-muted-foreground">{percentage}%</span>
        )}
      </div>
      <div 
        className="w-full bg-secondary rounded-full h-2"
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${percentage}% complete`}
      >
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="sr-only">
        {percentage}% complete
      </span>
    </div>
  );
};

// Alert component with proper ARIA attributes
interface AccessibleAlertProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export const AccessibleAlert: React.FC<AccessibleAlertProps> = ({
  type,
  title,
  message,
  dismissible = false,
  onDismiss,
  className = ''
}) => {
  const alertClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };

  const isError = type === 'error';

  return (
    <div 
      className={`border rounded-md p-4 ${alertClasses[type]} ${className}`}
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      aria-atomic="true"
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          {title && (
            <h3 className="font-medium mb-1">
              {title}
            </h3>
          )}
          <p className="text-sm">
            {message}
          </p>
        </div>
        {dismissible && onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-4 text-current hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-current focus:ring-offset-2 rounded"
            aria-label="Dismiss alert"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        )}
      </div>
    </div>
  );
};