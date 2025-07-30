import { useMemo } from 'react';
import { permissionsService } from '../services/PermissionsService';
import type { HaaLORole } from '../types';

export const useRoleCheck = (userId: string, tenantId: string, requiredRole: HaaLORole) => {
  const hasRequiredRole = useMemo(() => {
    return permissionsService.hasRole(userId, tenantId, requiredRole);
  }, [userId, tenantId, requiredRole]);

  return {
    hasRequiredRole,
    isAuthorized: hasRequiredRole
  };
};