import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useCoreAuth } from '@/contexts/CoreAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useStandardError } from '@/hooks/useStandardError';
import { useStandardLoading } from '@/hooks/useStandardLoading';
import { logger } from '@/lib/logger';

interface UserRole {
  role: string;
  company_id: string;
  company_settings?: {
    company_name: string;
    modules_enabled: string[];
  };
}

interface UserPermission {
  permission_name: string;
  description: string;
  resource: string;
  action: string;
}

interface PermissionContextType {
  // Role data
  userRoles: string[];
  primaryRole: string | null;
  companyId: string | null;
  companyName: string | null;
  
  // Permission data
  userPermissions: UserPermission[];
  companyModules: string[];
  
  // State
  loading: boolean;
  error: Error | null;
  
  // Role checks
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  
  // Permission checks
  hasPermission: (permission: string) => boolean;
  hasModuleAccess: (module: string) => boolean;
  canManageUsers: boolean;
  canManageSystem: boolean;
  canViewAnalytics: boolean;
  
  // Actions
  refreshPermissions: () => Promise<void>;
}

const EnhancedPermissionContext = createContext<PermissionContextType | undefined>(undefined);

/**
 * Enhanced Permission Provider - Handles all role and permission logic
 * Separated from core authentication for better architecture
 */
export const EnhancedPermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useCoreAuth();
  const { handleError, clearError, error } = useStandardError();
  const { withLoading, loading } = useStandardLoading();
  
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [primaryRole, setPrimaryRole] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermission[]>([]);
  const [companyModules, setCompanyModules] = useState<string[]>([]);

  const fetchUserRoles = async (userId: string) => {
    logger.debug('Fetching user roles', { userId, context: 'permission' });
    
    const { data, error } = await supabase
      .from('user_roles')
      .select(`
        role,
        company_id,
        company_settings (
          company_name,
          modules_enabled
        )
      `)
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to fetch user roles: ${error.message}`);
    }

    logger.debug('User roles fetched', { rolesCount: data?.length, context: 'permission' });
    return data as UserRole[];
  };

  const fetchUserPermissions = async (userId: string) => {
    logger.debug('Fetching user permissions', { userId, context: 'permission' });
    
    const { data, error } = await supabase.rpc('get_user_permissions', {
      user_id: userId
    });

    if (error) {
      throw new Error(`Failed to fetch user permissions: ${error.message}`);
    }

    logger.debug('User permissions fetched', { permissionsCount: data?.length, context: 'permission' });
    return data || [];
  };

  const refreshPermissions = async () => {
    if (!user?.id) {
      logger.debug('No user ID available for permission refresh', { context: 'permission' });
      return;
    }

    await withLoading(async () => {
      try {
        clearError();
        
        // Fetch roles and permissions in parallel
        const [rolesData, permissionsData] = await Promise.all([
          fetchUserRoles(user.id),
          fetchUserPermissions(user.id)
        ]);

        // Process roles
        if (rolesData && rolesData.length > 0) {
          const roles = rolesData.map(r => r.role);
          const primary = rolesData.find(r => r.role === 'super_admin') || rolesData[0];
          
          setUserRoles(roles);
          setPrimaryRole(primary.role);
          setCompanyId(primary.company_id);
          setCompanyName(primary.company_settings?.company_name || null);
          setCompanyModules(primary.company_settings?.modules_enabled || []);
          
          logger.info('User roles processed', {
            roles,
            primaryRole: primary.role,
            companyId: primary.company_id,
            context: 'permission'
          });
        } else {
          // Reset role state if no roles found
          setUserRoles([]);
          setPrimaryRole(null);
          setCompanyId(null);
          setCompanyName(null);
          setCompanyModules([]);
          
          logger.warn('No roles found for user', { context: 'permission' });
        }

        // Process permissions
        setUserPermissions(permissionsData);
        
        logger.info('Permission refresh completed successfully', { context: 'permission' });
      } catch (err) {
        handleError(err, { 
          context: 'Permission refresh',
          showToast: false // Handle errors silently for permission checks
        });
      }
    });
  };

  // Refresh permissions when user changes
  useEffect(() => {
    if (user?.id) {
      refreshPermissions();
    } else {
      // Clear state when user logs out
      setUserRoles([]);
      setPrimaryRole(null);
      setCompanyId(null);
      setCompanyName(null);
      setUserPermissions([]);
      setCompanyModules([]);
      clearError();
    }
  }, [user?.id]);

  // Role checking functions
  const hasRole = (role: string): boolean => {
    return userRoles.includes(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => userRoles.includes(role));
  };

  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every(role => userRoles.includes(role));
  };

  // Permission checking functions
  const hasPermission = (permission: string): boolean => {
    return userPermissions.some(p => p.permission_name === permission);
  };

  const hasModuleAccess = (module: string): boolean => {
    return companyModules.includes(module);
  };

  // Common permission checks
  const canManageUsers = hasPermission('manage_users') || hasRole('super_admin');
  const canManageSystem = hasPermission('manage_system') || hasRole('super_admin');
  const canViewAnalytics = hasPermission('view_analytics') || hasAnyRole(['super_admin', 'company_admin']);

  const value = {
    // Role data
    userRoles,
    primaryRole,
    companyId,
    companyName,
    
    // Permission data
    userPermissions,
    companyModules,
    
    // State
    loading,
    error,
    
    // Role checks
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // Permission checks
    hasPermission,
    hasModuleAccess,
    canManageUsers,
    canManageSystem,
    canViewAnalytics,
    
    // Actions
    refreshPermissions
  };

  return (
    <EnhancedPermissionContext.Provider value={value}>
      {children}
    </EnhancedPermissionContext.Provider>
  );
};

export const useEnhancedPermissionContext = () => {
  const context = useContext(EnhancedPermissionContext);
  if (context === undefined) {
    throw new Error('useEnhancedPermissionContext must be used within an EnhancedPermissionProvider');
  }
  return context;
};