import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { CoreAuthProvider } from '@/contexts/CoreAuthContext';
import { EnhancedPermissionProvider } from '@/contexts/EnhancedPermissionContext';
import { NavigationProvider } from '@/components/navigation/NavigationProvider';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';
import { createQueryClient } from '@/lib/queryClient';

interface AppProvidersProps {
  children: React.ReactNode;
}

// Create query client instance
const queryClient = createQueryClient();

/**
 * Unified App Providers Component
 * Combines all providers in the correct order for Phase 4 architecture
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          <CoreAuthProvider>
            <EnhancedPermissionProvider>
              <NavigationProvider>
                <SidebarProvider>
                  {children}
                  <Toaster />
                </SidebarProvider>
              </NavigationProvider>
            </EnhancedPermissionProvider>
          </CoreAuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};