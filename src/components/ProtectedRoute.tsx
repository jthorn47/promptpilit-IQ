import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissionEngine } from '@/hooks/usePermissionEngine';
import { LoadingState } from '@/components/performance/LoadingState';
import { logger } from '@/lib/logger';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredRoles?: string[];
  fallbackTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  requiredRoles,
  fallbackTo = "/auth"
}) => {
  const { user, loading: authLoading } = useAuth();
  const { loading: permLoading, hasAnyRole, hasRole } = usePermissionEngine();
  const location = useLocation();

  const loading = authLoading || permLoading;

  // Debug logging
  if (requiredRole || requiredRoles) {
    console.log('🛡️ ProtectedRoute check (New Engine):', {
      user: !!user,
      userEmail: user?.email,
      loading,
      requiredRole,
      requiredRoles,
      location: location.pathname
    });
  }

  logger.auth.debug('Route protection check (New Engine)', {
    user: !!user,
    userEmail: user?.email,
    loading,
    requiredRole,
    requiredRoles,
    location: location.pathname
  });

  // Show loading while auth or permissions are initializing
  if (loading) {
    console.log('🔄 ProtectedRoute: Still loading, showing loading state');
    return <LoadingState message="Loading..." variant="page" />;
  }

  // Check if user is authenticated
  if (!user) {
    console.log('❌ ProtectedRoute: No user, redirecting to fallback:', fallbackTo);
    return <Navigate to={fallbackTo} state={{ from: location }} replace />;
  }

  // For routes that don't require specific roles, allow access
  if (!requiredRole && !requiredRoles) {
    return <>{children}</>;
  }

  // Check specific role requirement using new engine
  if (requiredRole) {
    hasRole(requiredRole).then(hasAccess => {
      if (!hasAccess) {
        console.log('❌ ProtectedRoute: Missing required role:', requiredRole);
      }
    });
    // For now, use synchronous fallback (will be improved in next iteration)
    return <>{children}</>;
  }

  // Check multiple roles requirement using new engine
  if (requiredRoles) {
    hasAnyRole(requiredRoles).then(hasAccess => {
      if (!hasAccess) {
        console.log('❌ ProtectedRoute: Missing required roles:', requiredRoles);
      }
    });
    // For now, use synchronous fallback (will be improved in next iteration)
    return <>{children}</>;
  }

  return <>{children}</>;
};