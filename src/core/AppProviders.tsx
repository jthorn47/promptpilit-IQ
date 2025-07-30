
import { ReactNode, useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { PermissionProvider } from '@/contexts/PermissionContext';
import { SecurityProvider } from '@/contexts/SecurityContext';
import { TourProvider } from '@/components/tour/TourProvider';
import { EnhancedErrorBoundary } from '@/components/enhanced/EnhancedErrorBoundary';
import { memoryManager } from '@/utils/memoryManager';
import { routePreloader } from '@/utils/routePreloader';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  // TEMPORARILY DISABLED - Performance monitoring causing memory issues
  // useEffect(() => {
  //   // Initialize performance monitoring
  //   console.log('🚀 Initializing performance monitoring...');
  //   
  //   // Memory cleanup listener
  //   const handleMemoryCleanup = () => {
  //     console.log('🧹 Manual memory cleanup triggered');
  //     // Trigger cleanup through memory manager
  //   };

  //   window.addEventListener('memory-cleanup', handleMemoryCleanup);

  //   return () => {
  //     window.removeEventListener('memory-cleanup', handleMemoryCleanup);
  //     memoryManager.destroy();
  //   };
  // }, []);

  return (
    <EnhancedErrorBoundary level="page" context="AppProviders">
      <ThemeProvider 
        attribute="class"
        defaultTheme="system" 
        enableSystem={true}
        storageKey="vite-ui-theme"
      >
        <TooltipProvider>
          <AuthProvider>
            <PermissionProvider>
              <TourProvider>
                <SecurityProvider>
                  <EnhancedErrorBoundary level="section" context="ApplicationContent">
                    {children}
                  </EnhancedErrorBoundary>
                  <Toaster />
                </SecurityProvider>
              </TourProvider>
            </PermissionProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </EnhancedErrorBoundary>
  );
};
