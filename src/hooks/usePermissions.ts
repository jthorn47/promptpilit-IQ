import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Permission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role: string;
  permission_id: string;
  created_at: string;
  permissions: Permission;
}

export const usePermissions = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPermissions = async () => {
    try {
      console.log('🔍 Fetching permissions...');
      const { data, error } = await supabase
        .from('permissions')
        .select('*')
        .order('resource', { ascending: true });

      if (error) {
        console.error('❌ Error fetching permissions:', error);
        throw error;
      }
      console.log('✅ Permissions fetched:', data?.length);
      setPermissions(data || []);
    } catch (error) {
      console.error('❌ Error fetching permissions:', error);
    }
  };

  const fetchRolePermissions = async () => {
    try {
      console.log('🔍 Fetching role permissions...');
      const { data, error } = await supabase
        .from('role_permissions')
        .select(`
          *,
          permissions (*)
        `)
        .order('role', { ascending: true });

      if (error) {
        console.error('❌ Error fetching role permissions:', error);
        throw error;
      }
      console.log('✅ Role permissions fetched:', data?.length);
      setRolePermissions(data || []);
    } catch (error) {
      console.error('❌ Error fetching role permissions:', error);
    }
  };

  const assignPermissionToRole = async (role: string, permissionId: string) => {
    try {
      const { error } = await supabase
        .from('role_permissions')
        .insert({ role: role as any, permission_id: permissionId });

      if (error) throw error;
      await fetchRolePermissions();
      return { success: true };
    } catch (error) {
      console.error('Error assigning permission to role:', error);
      return { success: false, error };
    }
  };

  const removePermissionFromRole = async (role: string, permissionId: string) => {
    try {
      const { error } = await supabase
        .from('role_permissions')
        .delete()
        .eq('role', role as any)
        .eq('permission_id', permissionId);

      if (error) throw error;
      await fetchRolePermissions();
      return { success: true };
    } catch (error) {
      console.error('Error removing permission from role:', error);
      return { success: false, error };
    }
  };

  const createPermission = async (permission: Omit<Permission, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from('permissions')
        .insert(permission);

      if (error) throw error;
      await fetchPermissions();
      return { success: true };
    } catch (error) {
      console.error('Error creating permission:', error);
      return { success: false, error };
    }
  };

  const updatePermission = async (id: string, updates: Partial<Permission>) => {
    try {
      const { error } = await supabase
        .from('permissions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchPermissions();
      return { success: true };
    } catch (error) {
      console.error('Error updating permission:', error);
      return { success: false, error };
    }
  };

  const deletePermission = async (id: string) => {
    try {
      const { error } = await supabase
        .from('permissions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchPermissions();
      return { success: true };
    } catch (error) {
      console.error('Error deleting permission:', error);
      return { success: false, error };
    }
  };

  const hasPermission = async (permissionName: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .rpc('user_has_permission', {
          user_id: user.id,
          permission_name: permissionName
        });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  };

  const getUserPermissions = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .rpc('get_user_permissions', {
          user_id: user.id
        });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }
  };

  const fetchUserPermissions = async () => {
    if (!user) {
      setUserPermissions([]);
      return;
    }

    try {
      console.log('🔍 Fetching user permissions for:', user.id);
      const { data, error } = await supabase
        .rpc('get_user_permissions', {
          user_id: user.id
        });

      if (error) throw error;
      
      // Convert the RPC result to Permission objects
      const userPerms = (data || []).map((perm: any) => ({
        id: perm.permission_name, // Use permission name as ID for matching
        name: perm.permission_name,
        description: perm.description,
        resource: perm.resource,
        action: perm.action,
        created_at: '',
        updated_at: ''
      }));
      
      console.log('✅ User permissions fetched:', userPerms.length);
      setUserPermissions(userPerms);
    } catch (error) {
      console.error('❌ Error fetching user permissions:', error);
      setUserPermissions([]);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      console.log('🔍 usePermissions: Starting data load...');
      setLoading(true);
      await Promise.all([
        fetchPermissions(), 
        fetchRolePermissions(),
        fetchUserPermissions()
      ]);
      setLoading(false);
      console.log('✅ usePermissions: Data load complete');
    };

    loadData();
  }, [user?.id]);

  return {
    permissions,
    rolePermissions,
    userPermissions,
    loading,
    assignPermissionToRole,
    removePermissionFromRole,
    createPermission,
    updatePermission,
    deletePermission,
    hasPermission,
    getUserPermissions,
    refetch: () => Promise.all([fetchPermissions(), fetchRolePermissions(), fetchUserPermissions()])
  };
};