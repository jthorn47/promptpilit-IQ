
import React from 'react';
import { useBreakpoint } from '@/hooks/use-mobile';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

interface MobileAwareLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const MobileAwareLayout: React.FC<MobileAwareLayoutProps> = ({
  sidebar,
  children,
  className = ''
}) => {
  const { isMobile } = useBreakpoint();

  return (
    <SidebarProvider>
      <div className={`flex h-screen bg-background ${className}`}>
        {/* Header with sidebar trigger for mobile */}
        {isMobile && (
          <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-background border-b flex items-center px-4">
            <SidebarTrigger className="mr-2" />
          </header>
        )}
        
        {/* Sidebar - responsive */}
        <div className={`${isMobile ? 'w-0' : 'w-64'} flex-shrink-0 ${isMobile ? '' : 'border-r'}`}>
          {sidebar}
        </div>
        
        {/* Main Content */}
        <main className={`flex-1 overflow-auto ${isMobile ? 'pt-14' : ''}`}>
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default MobileAwareLayout;
