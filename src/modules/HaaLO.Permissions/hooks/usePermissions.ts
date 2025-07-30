import { useState, useCallback } from 'react';
import { permissionsService } from '../services/PermissionsService';
import type { HaaLORole, HaaLOModule, PermissionAction, PermissionCheckResult } from '../types';

export const usePermissions = (userId: string, tenantId: string) => {
  const [loading, setLoading] = useState(false);

  const checkPermission = useCallback(async (
    module: HaaLOModule,
    resource: string,
    action: PermissionAction,
    context?: Record<string, any>
  ): Promise<PermissionCheckResult> => {
    setLoading(true);
    try {
      return await permissionsService.checkPermission(userId, tenantId, module, resource, action, context);
    } finally {
      setLoading(false);
    }
  }, [userId, tenantId]);

  const hasRole = useCallback((role: HaaLORole): boolean => {
    return permissionsService.hasRole(userId, tenantId, role);
  }, [userId, tenantId]);

  const getUserRoles = useCallback((): HaaLORole[] => {
    return permissionsService.getUserRoles(userId, tenantId);
  }, [userId, tenantId]);

  return {
    checkPermission,
    hasRole,
    getUserRoles,
    loading
  };
};