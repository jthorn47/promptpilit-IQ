import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyModuleWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  moduleName?: string;
}

const DefaultLoader = ({ moduleName }: { moduleName?: string }) => (
  <div className="flex items-center justify-center min-h-[400px] bg-background/50">
    <div className="flex flex-col items-center gap-4 p-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="text-center">
        <p className="text-lg font-medium">Loading {moduleName || 'Module'}...</p>
        <p className="text-sm text-muted-foreground">Please wait while we prepare your workspace</p>
      </div>
    </div>
  </div>
);

/**
 * Wrapper component for lazy-loaded modules with consistent loading states
 */
export const LazyModuleWrapper: React.FC<LazyModuleWrapperProps> = ({ 
  children, 
  fallback, 
  moduleName 
}) => {
  return (
    <Suspense fallback={fallback || <DefaultLoader moduleName={moduleName} />}>
      {children}
    </Suspense>
  );
};

export default LazyModuleWrapper;