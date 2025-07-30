import { useState, useEffect, useCallback } from 'react';
import { authzService, Permission, RolePermission } from '@/services/authzService';
import { useAuth } from '@/contexts/AuthContext';

export interface UseAuthzServiceReturn {
  permissions: Permission[];
  rolePermissions: RolePermission[];
  userRoles: string[];
  userPermissions: Permission[];
  loading: boolean;
  error: string | null;
  
  // Permission operations
  checkPermission: (permission: string, resource?: string) => Promise<boolean>;
  
  // Role management
  assignRole: (userId: string, role: string) => Promise<{ success: boolean; error?: any }>;
  removeRole: (userId: string, role: string) => Promise<{ success: boolean; error?: any }>;
  
  // Permission management
  createPermission: (permission: Omit<Permission, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: any }>;
  updatePermission: (id: string, updates: Partial<Permission>) => Promise<{ success: boolean; error?: any }>;
  deletePermission: (id: string) => Promise<{ success: boolean; error?: any }>;
  
  // Role-Permission assignments
  assignPermissionToRole: (role: string, permissionId: string) => Promise<{ success: boolean; error?: any }>;
  removePermissionFromRole: (role: string, permissionId: string) => Promise<{ success: boolean; error?: any }>;
  
  // Refetch data
  refetch: () => Promise<void>;
}

export const useAuthzService = (): UseAuthzServiceReturn => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        permissionsData,
        rolePermissionsData,
        userRolesData,
        userPermissionsData
      ] = await Promise.all([
        authzService.getPermissions(),
        authzService.getRolePermissions(),
        authzService.getUserRoles(user.id),
        authzService.getUserPermissions(user.id)
      ]);

      setPermissions(permissionsData);
      setRolePermissions(rolePermissionsData);
      setUserRoles(userRolesData.map(ur => ur.role));
      setUserPermissions(userPermissionsData);
    } catch (err) {
      console.error('Error fetching authz data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const checkPermission = useCallback(async (permission: string, resource?: string): Promise<boolean> => {
    if (!user?.id) return false;
    return authzService.checkPermission(user.id, permission, resource);
  }, [user?.id]);

  const assignRole = useCallback(async (userId: string, role: string) => {
    try {
      await authzService.assignRole(userId, role);
      await fetchAllData(); // Refresh data
      return { success: true };
    } catch (error) {
      console.error('Error assigning role:', error);
      return { success: false, error };
    }
  }, [fetchAllData]);

  const removeRole = useCallback(async (userId: string, role: string) => {
    try {
      await authzService.removeRole(userId, role);
      await fetchAllData(); // Refresh data
      return { success: true };
    } catch (error) {
      console.error('Error removing role:', error);
      return { success: false, error };
    }
  }, [fetchAllData]);

  const createPermission = useCallback(async (permissionData: Omit<Permission, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await authzService.createPermission(permissionData);
      await fetchAllData(); // Refresh data
      return { success: true };
    } catch (error) {
      console.error('Error creating permission:', error);
      return { success: false, error };
    }
  }, [fetchAllData]);

  const updatePermission = useCallback(async (id: string, updates: Partial<Permission>) => {
    try {
      await authzService.updatePermission(id, updates);
      await fetchAllData(); // Refresh data
      return { success: true };
    } catch (error) {
      console.error('Error updating permission:', error);
      return { success: false, error };
    }
  }, [fetchAllData]);

  const deletePermission = useCallback(async (id: string) => {
    try {
      await authzService.deletePermission(id);
      await fetchAllData(); // Refresh data
      return { success: true };
    } catch (error) {
      console.error('Error deleting permission:', error);
      return { success: false, error };
    }
  }, [fetchAllData]);

  const assignPermissionToRole = useCallback(async (role: string, permissionId: string) => {
    try {
      await authzService.assignPermissionToRole(role, permissionId);
      await fetchAllData(); // Refresh data
      return { success: true };
    } catch (error) {
      console.error('Error assigning permission to role:', error);
      return { success: false, error };
    }
  }, [fetchAllData]);

  const removePermissionFromRole = useCallback(async (role: string, permissionId: string) => {
    try {
      await authzService.removePermissionFromRole(role, permissionId);
      await fetchAllData(); // Refresh data
      return { success: true };
    } catch (error) {
      console.error('Error removing permission from role:', error);
      return { success: false, error };
    }
  }, [fetchAllData]);

  return {
    permissions,
    rolePermissions,
    userRoles,
    userPermissions,
    loading,
    error,
    checkPermission,
    assignRole,
    removeRole,
    createPermission,
    updatePermission,
    deletePermission,
    assignPermissionToRole,
    removePermissionFromRole,
    refetch: fetchAllData,
  };
};