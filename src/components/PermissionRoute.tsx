
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissionEngine } from '@/hooks/usePermissionEngine';
import { LoadingState } from '@/components/performance/LoadingState';

interface PermissionRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
  requiredModule?: string;
  fallbackTo?: string;
}

export const PermissionRoute: React.FC<PermissionRouteProps> = ({ 
  children, 
  requiredPermission,
  requiredModule,
  fallbackTo = "/unauthorized"
}) => {
  const { 
    loading, 
    permissionsLoaded,
    canAccessSync, 
    hasModuleAccess,
    assignedModules
  } = usePermissionEngine();
  const location = useLocation();

  console.log('🛡️ PermissionRoute check (New Engine):', {
    loading,
    permissionsLoaded,
    requiredPermission,
    requiredModule,
    assignedModules,
    location: location.pathname
  });

  // Show loading while permissions are being initialized
  if (loading || !permissionsLoaded) {
    return <LoadingState message="Loading permissions..." variant="page" />;
  }

  // Check permission requirement using new engine
  if (requiredPermission) {
    const [feature, action = 'view'] = requiredPermission.split(':');
    const hasPermission = canAccessSync(feature, action);
    
    if (!hasPermission) {
      console.log('❌ PermissionRoute: Missing permission:', requiredPermission);
      return <Navigate to={fallbackTo} replace />;
    }
  }

  // Check module requirement
  if (requiredModule && !hasModuleAccess(requiredModule)) {
    console.log('❌ PermissionRoute: Missing module access:', requiredModule);
    return <Navigate to={fallbackTo} replace />;
  }

  return <>{children}</>;
};
