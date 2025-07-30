import React from 'react';
import { usePermissionEngine } from '@/hooks/usePermissionEngine';
import { LoadingState } from '@/components/performance/LoadingState';

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredModule?: string;
  fallback?: React.ReactNode;
  showLoading?: boolean;
  context?: Record<string, any>;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  requiredPermission,
  requiredModule,
  fallback = null,
  showLoading = false,
  context = {}
}) => {
  const { 
    loading, 
    permissionsLoaded,
    canAccessSync, 
    hasModuleAccess 
  } = usePermissionEngine();

  // Show loading while permissions are being initialized
  if (showLoading && (loading || !permissionsLoaded)) {
    return <LoadingState message="Loading permissions..." variant="inline" />;
  }

  // Don't render anything if permissions aren't loaded yet
  if (!permissionsLoaded) {
    return <>{fallback}</>;
  }

  // Check permission requirement
  if (requiredPermission) {
    const [feature, action = 'view'] = requiredPermission.split(':');
    const hasPermission = canAccessSync(feature, action);
    
    if (!hasPermission) {
      return <>{fallback}</>;
    }
  }

  // Check module requirement
  if (requiredModule && !hasModuleAccess(requiredModule)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};