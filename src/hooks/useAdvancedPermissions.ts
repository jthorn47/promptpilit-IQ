import { useState, useCallback } from 'react';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/lib/logger';

export interface PermissionModule {
  id: string;
  name: string;
  description: string;
  category: string;
  permissions: string[];
  isEnabled: boolean;
  requiredRole?: string;
}

export interface UserPermissionProfile {
  userId: string;
  roles: string[];
  permissions: string[];
  modules: string[];
  restrictions: Record<string, any>;
  lastUpdated: string;
}

export interface PermissionAuditEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: string;
  success: boolean;
  metadata: Record<string, any>;
}

export const useAdvancedPermissions = () => {
  const { user } = useAuth();
  const permissionContext = usePermissionContext();
  const [modules] = useState<PermissionModule[]>([]);
  const [userProfile] = useState<UserPermissionProfile | null>(null);
  const [auditLog] = useState<PermissionAuditEntry[]>([]);
  const [loading] = useState(false);

  // Enhanced Permission Check with Context - uses new permission engine
  const checkAdvancedPermission = useCallback(async (
    permission: string,
    resource?: string,
    context?: Record<string, any>
  ) => {
    try {
      // Parse permission into feature and action
      const [feature, action = 'view'] = permission.split(':');
      
      // Use new permission engine
      const hasPermission = await permissionContext.canAccess(feature, action, {
        resourceId: resource,
        resourceType: context?.resourceType,
        targetUserId: context?.targetUserId,
        companyId: context?.companyId,
        clientId: context?.clientId
      });
      
      // Log the permission check
      logger.auth.info('Advanced permission check', {
        permission,
        resource,
        context,
        result: hasPermission,
        userId: user?.id
      });

      return hasPermission;
    } catch (error) {
      logger.auth.error('Advanced permission check failed', error);
      return false;
    }
  }, [permissionContext, user?.id]);

  // Bulk Permission Check
  const checkMultiplePermissions = useCallback(async (
    permissions: string[],
    resource?: string
  ) => {
    try {
      const results = await Promise.all(
        permissions.map(permission => 
          checkAdvancedPermission(permission, resource)
        )
      );

      return permissions.reduce((acc, permission, index) => {
        acc[permission] = results[index];
        return acc;
      }, {} as Record<string, boolean>);
    } catch (error) {
      logger.auth.error('Bulk permission check failed', error);
      return {};
    }
  }, [checkAdvancedPermission]);

  // Placeholder functions for module management (will be implemented when types are available)
  const getPermissionModules = useCallback(async () => {
    logger.auth.info('Permission modules will be available after types update');
    return [];
  }, []);

  const getUserPermissionProfile = useCallback(async (userId: string) => {
    logger.auth.info('User permission profile will be available after types update', { userId });
    return null;
  }, []);

  const getPermissionAuditLog = useCallback(async (userId?: string, limit: number = 50) => {
    logger.auth.info('Permission audit log will be available after types update', { userId, limit });
    return [];
  }, []);

  const assignModuleToUser = useCallback(async (
    userId: string,
    moduleId: string,
    assignedBy?: string
  ) => {
    logger.auth.info('Module assignment will be available after types update', { userId, moduleId, assignedBy });
    return { success: false, error: 'Not implemented yet' };
  }, []);

  const removeModuleFromUser = useCallback(async (
    userId: string,
    moduleId: string
  ) => {
    logger.auth.info('Module removal will be available after types update', { userId, moduleId });
    return { success: false, error: 'Not implemented yet' };
  }, []);

  return {
    // State
    modules,
    userProfile,
    auditLog,
    loading,

    // Core functionality
    checkAdvancedPermission,
    checkMultiplePermissions,
    getUserPermissionProfile,
    getPermissionModules,
    getPermissionAuditLog,

    // Module management
    assignModuleToUser,
    removeModuleFromUser,

    // Legacy permission context (for backwards compatibility)
    ...permissionContext
  };
};