import React from 'react';
import { UniversalTopNav } from '@/components/navigation/UniversalTopNav';
import { useAuth } from '@/contexts/AuthContext';

interface UnifiedLayoutProps {
  children: React.ReactNode;
  showSuperAdminBadge?: boolean;
}

export const UnifiedLayout: React.FC<UnifiedLayoutProps> = ({ 
  children, 
  showSuperAdminBadge = false 
}) => {
  const { userRoles } = useAuth();
  const isSuperAdmin = userRoles?.includes('super_admin');

  console.log('🔍 UnifiedLayout Debug - Using Universal Top Navigation:', { 
    userRoles, 
    isSuperAdmin,
    showSuperAdminBadge 
  });

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Universal Top Navigation */}
      <UniversalTopNav />
      
      {/* Main Content Area - Mobile Scrollable */}
      <div className="flex-1 overflow-hidden">
        <div 
          className="h-full overflow-y-scroll px-4 md:px-8 max-w-[1440px] mx-auto w-full pb-24 md:pb-8"
          style={{
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};