
import React from 'react';
import { useBreakpoint } from '@/hooks/use-mobile';
import { MobileBottomTabs } from '@/components/mobile/MobileBottomTabs';

interface ResponsiveSidebarProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({ 
  children, 
  className = '' 
}) => {
  const { isMobile } = useBreakpoint();

  if (isMobile) {
    return <MobileBottomTabs />;
  }

  return (
    <aside className={`${className}`}>
      {children}
    </aside>
  );
};

export default ResponsiveSidebar;
