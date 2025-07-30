import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissionContext } from '@/contexts/PermissionContext';

export interface RolePermissions {
  // Core roles
  isSuperAdmin: boolean;
  isCompanyAdmin: boolean;
  isClientAdmin: boolean;
  isLearner: boolean;
  isAdmin: boolean;
  isUser: boolean;
  isManager: boolean;
  
  // Permission checks
  canManageCompanies: boolean;
  canManageUsers: boolean;
  canManageTraining: boolean;
  canViewAnalytics: boolean;
  canManageIntegrations: boolean;
  canManageSystem: boolean;
  canAccessAdmin: boolean;
  
  // Utility functions
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  
  // Loading state
  loading: boolean;
}

/**
 * Centralized role management hook
 * Provides consistent role checking across the application with memoization
 * Enhanced with additional role checking utilities and performance optimization
 */
export const useAuthRole = (): RolePermissions => {
  const { user, loading } = useAuth();
  const { 
    canManageUsers,
    canManageSystem,
    canViewAnalytics,
    hasRole,
    hasAnyRole 
  } = usePermissionContext();
  
  return useMemo(() => {
    const userRoles = user?.user_metadata?.roles || [];
    
    // Core role checks
    const isSuperAdmin = userRoles.includes('super_admin');
    const isCompanyAdmin = userRoles.includes('company_admin');
    const isClientAdmin = userRoles.includes('client_admin');
    const isLearner = userRoles.includes('learner');
    const isManager = userRoles.includes('manager');
    const isUser = userRoles.includes('user');
    const isAdmin = isSuperAdmin || isCompanyAdmin || isClientAdmin;
    
    // Enhanced role checking functions
    const enhancedHasRole = (role: string): boolean => {
      return userRoles.includes(role);
    };
    
    const enhancedHasAnyRole = (roles: string[]): boolean => {
      return roles.some(role => userRoles.includes(role));
    };
    
    const hasAllRoles = (roles: string[]): boolean => {
      return roles.every(role => userRoles.includes(role));
    };
    
    return {
      // Core roles
      isSuperAdmin,
      isCompanyAdmin,
      isClientAdmin,
      isLearner,
      isAdmin,
      isUser,
      isManager,
      loading,
      
      // Permission checks (using permission context when available)
      canManageCompanies: canManageSystem || isSuperAdmin,
      canManageUsers: canManageUsers || isSuperAdmin,
      canManageTraining: canManageSystem || isSuperAdmin || isCompanyAdmin,
      canViewAnalytics: canViewAnalytics || isSuperAdmin || isCompanyAdmin,
      canManageIntegrations: canManageSystem || isSuperAdmin,
      canManageSystem: canManageSystem || isSuperAdmin,
      canAccessAdmin: isSuperAdmin || isCompanyAdmin || isManager,
      
      // Utility functions (ensure synchronous behavior)
      hasRole: enhancedHasRole, // Use local synchronous version for consistent behavior
      hasAnyRole: enhancedHasAnyRole,
      hasAllRoles,
    };
  }, [user, loading, canManageUsers, canManageSystem, canViewAnalytics, hasRole, hasAnyRole]);
};