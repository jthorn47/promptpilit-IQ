import { supabase } from '@/integrations/supabase/client';

export interface Permission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  created_at?: string;
  updated_at?: string;
}

export interface RolePermission {
  id: string;
  role: string;
  permission_id: string;
  created_at?: string;
  permission?: Permission;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: string;
  company_id?: string;
  created_at?: string;
  updated_at?: string;
}

class AuthzService {
  private baseUrl: string;

  constructor() {
    // Use the Supabase project URL directly
    this.baseUrl = `https://xfamotequcavggiqndfj.supabase.co/functions/v1/authz-service`;
  }

  private async makeRequest(action: string, data: any = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ action, ...data }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Permission checking
  async checkPermission(userId: string, permission: string, resource?: string): Promise<boolean> {
    try {
      const result = await this.makeRequest('check_permission', {
        userId,
        permission,
        resource,
      });
      return result.hasPermission || false;
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  // User role management
  async getUserRoles(userId: string): Promise<UserRole[]> {
    const result = await this.makeRequest('get_user_roles', { userId });
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result.data || [];
  }

  async getUserPermissions(userId: string): Promise<Permission[]> {
    const result = await this.makeRequest('get_user_permissions', { userId });
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result.data || [];
  }

  async assignRole(userId: string, role: string): Promise<UserRole> {
    const result = await this.makeRequest('assign_role', { userId, role });
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result.data[0];
  }

  async removeRole(userId: string, role: string): Promise<void> {
    const result = await this.makeRequest('remove_role', { userId, role });
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  // System-wide role and permission management
  async getRoles(): Promise<string[]> {
    const result = await this.makeRequest('get_roles');
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result.data || [];
  }

  async getPermissions(): Promise<Permission[]> {
    const result = await this.makeRequest('get_permissions');
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result.data || [];
  }

  async createPermission(permissionData: Omit<Permission, 'id' | 'created_at' | 'updated_at'>): Promise<Permission> {
    const result = await this.makeRequest('create_permission', { permissionData });
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result.data[0];
  }

  async updatePermission(permissionId: string, permissionData: Partial<Permission>): Promise<Permission> {
    const result = await this.makeRequest('update_permission', { permissionId, permissionData });
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result.data[0];
  }

  async deletePermission(permissionId: string): Promise<void> {
    const result = await this.makeRequest('delete_permission', { permissionId });
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  async assignPermissionToRole(role: string, permissionId: string): Promise<RolePermission> {
    const result = await this.makeRequest('assign_permission_to_role', { role, permissionId });
    if (result.error) {
      throw new Error(result.error.message);
    }
    return result.data[0];
  }

  async removePermissionFromRole(role: string, permissionId: string): Promise<void> {
    const result = await this.makeRequest('remove_permission_from_role', { role, permissionId });
    if (result.error) {
      throw new Error(result.error.message);
    }
  }

  // Role permissions - get all permissions for roles
  async getRolePermissions(): Promise<RolePermission[]> {
    // This uses direct database access for now, can be moved to microservice later
    const { data, error } = await supabase
      .from('role_permissions')
      .select(`
        *,
        permission:permissions(*)
      `);

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }
}

export const authzService = new AuthzService();