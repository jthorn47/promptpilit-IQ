import { supabase } from '@/integrations/supabase/client'

// Base configuration for microservices
const SERVICES_CONFIG = {
  userService: {
    baseUrl: `${import.meta.env.VITE_SUPABASE_URL || 'https://xfamotequcavggiqndfj.supabase.co'}/functions/v1/user-service`,
  },
  roleService: {
    baseUrl: `${import.meta.env.VITE_SUPABASE_URL || 'https://xfamotequcavggiqndfj.supabase.co'}/functions/v1/role-service`,
  },
  jobTitleService: {
    baseUrl: `${import.meta.env.VITE_SUPABASE_URL || 'https://xfamotequcavggiqndfj.supabase.co'}/functions/v1/job-title-service`,
  },
  vaultService: {
    baseUrl: `${import.meta.env.VITE_SUPABASE_URL || 'https://xfamotequcavggiqndfj.supabase.co'}/functions/v1/vault-service`,
  }
}

class MicroservicesClient {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      throw new Error('Authentication required')
    }

    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhmYW1vdGVxdWNhdmdnaXFuZGZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE2MTg2NTEsImV4cCI6MjA2NzE5NDY1MX0.f3yZ55pFCc9yLOUvUssb1S04-alf_IZ2e_f5wJ0bGWw'
    }
  }

  private async makeRequest(service: 'userService' | 'roleService' | 'jobTitleService' | 'vaultService', endpoint: string, options: RequestInit = {}) {
    const headers = await this.getAuthHeaders()
    const url = `${SERVICES_CONFIG[service].baseUrl}/${endpoint}`

    console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`)

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error(`❌ API Error: ${response.status} ${response.statusText}`, errorData)
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  // User Service Methods
  async getCurrentUser() {
    return this.makeRequest('userService', 'users/me')
  }

  async getUser(userId: string) {
    return this.makeRequest('userService', `users/${userId}`)
  }

  async createUser(userData: any) {
    return this.makeRequest('userService', 'users', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async updateUser(userId: string, updateData: any) {
    return this.makeRequest('userService', `users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })
  }

  async getUserRoles(userId: string) {
    return this.makeRequest('userService', `users/${userId}/roles`)
  }

  async assignRoleToUser(userId: string, roleData: any) {
    return this.makeRequest('userService', `users/${userId}/roles`, {
      method: 'POST',
      body: JSON.stringify(roleData),
    })
  }

  async removeRoleFromUser(userId: string, roleId: string) {
    return this.makeRequest('userService', `users/${userId}/roles/${roleId}`, {
      method: 'DELETE',
    })
  }

  // Role Service Methods
  async getRoles() {
    return this.makeRequest('roleService', 'roles')
  }

  async createRole(roleData: any) {
    return this.makeRequest('roleService', 'roles', {
      method: 'POST',
      body: JSON.stringify(roleData),
    })
  }

  async getPermissions() {
    return this.makeRequest('roleService', 'permissions')
  }

  async createPermission(permissionData: any) {
    return this.makeRequest('roleService', 'permissions', {
      method: 'POST',
      body: JSON.stringify(permissionData),
    })
  }

  async updatePermission(permissionId: string, updateData: any) {
    return this.makeRequest('roleService', `permissions/${permissionId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })
  }

  async deletePermission(permissionId: string) {
    return this.makeRequest('roleService', `permissions/${permissionId}`, {
      method: 'DELETE',
    })
  }

  async getRolePermissions() {
    return this.makeRequest('roleService', 'role-permissions')
  }

  async assignPermissionToRole(rolePermissionData: any) {
    return this.makeRequest('roleService', 'role-permissions', {
      method: 'POST',
      body: JSON.stringify(rolePermissionData),
    })
  }

  async removePermissionFromRole(rolePermissionId: string) {
    return this.makeRequest('roleService', `role-permissions/${rolePermissionId}`, {
      method: 'DELETE',
    })
  }

  async getUserPermissions(userId?: string) {
    const endpoint = userId ? `users/${userId}/permissions` : 'users/me/permissions'
    return this.makeRequest('roleService', endpoint)
  }

  async checkPermission(permissionName: string, userId?: string) {
    return this.makeRequest('roleService', 'permissions/check', {
      method: 'POST',
      body: JSON.stringify({
        permission_name: permissionName,
        user_id: userId,
      }),
    })
  }

  async bulkCheckPermissions(permissionNames: string[], userId?: string) {
    return this.makeRequest('roleService', 'permissions/bulk-check', {
      method: 'POST',
      body: JSON.stringify({
        permissions: permissionNames,
        user_id: userId,
      }),
    })
  }

  // Job Title Service Methods
  async getJobTitles() {
    return this.makeRequest('jobTitleService', 'job-titles')
  }

  async getJobTitle(jobTitleId: string) {
    return this.makeRequest('jobTitleService', `job-titles/${jobTitleId}`)
  }

  async createJobTitle(jobTitleData: any) {
    return this.makeRequest('jobTitleService', 'job-titles', {
      method: 'POST',
      body: JSON.stringify(jobTitleData),
    })
  }

  async updateJobTitle(jobTitleId: string, updateData: any) {
    return this.makeRequest('jobTitleService', `job-titles/${jobTitleId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })
  }

  async deleteJobTitle(jobTitleId: string) {
    return this.makeRequest('jobTitleService', `job-titles/${jobTitleId}`, {
      method: 'DELETE',
    })
  }

  // Vault Service Methods
  async getVaultFiles(filter?: any) {
    const params = filter ? `?${new URLSearchParams(filter).toString()}` : ''
    return this.makeRequest('vaultService', `files${params}`)
  }

  async uploadVaultFile(fileData: FormData) {
    const headers = await this.getAuthHeaders()
    delete headers['Content-Type'] // Let browser set content-type for FormData
    
    const url = `${SERVICES_CONFIG.vaultService.baseUrl}/files/upload`
    console.log(`🌐 API Request: POST ${url}`)

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: fileData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
      console.error(`❌ API Error: ${response.status} ${response.statusText}`, errorData)
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async getVaultFile(fileId: string) {
    return this.makeRequest('vaultService', `files/${fileId}`)
  }

  async deleteVaultFile(fileId: string) {
    return this.makeRequest('vaultService', `files/${fileId}`, {
      method: 'DELETE',
    })
  }

  async shareVaultFile(fileId: string, shareData: any) {
    return this.makeRequest('vaultService', `files/${fileId}/share`, {
      method: 'POST',
      body: JSON.stringify(shareData),
    })
  }

  async getVaultFileShares(fileId: string) {
    return this.makeRequest('vaultService', `files/${fileId}/shares`)
  }

  async updateVaultFileShare(shareId: string, updateData: any) {
    return this.makeRequest('vaultService', `shares/${shareId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    })
  }

  async deleteVaultFileShare(shareId: string) {
    return this.makeRequest('vaultService', `shares/${shareId}`, {
      method: 'DELETE',
    })
  }

  async getVaultStats() {
    return this.makeRequest('vaultService', 'stats')
  }

  async searchVaultFiles(searchQuery: string, filters?: any) {
    const params = new URLSearchParams({ q: searchQuery, ...(filters || {}) })
    return this.makeRequest('vaultService', `search?${params.toString()}`)
  }
}

// Export singleton instance
export const microservicesClient = new MicroservicesClient()

// Export types
export interface User {
  id: string
  user_id: string
  email: string
  created_at: string
  updated_at: string
  company_id?: string
  completed_tours: string[]
  is_employee: boolean
}

export interface Role {
  id: string
  user_id: string
  role: string
  company_id?: string
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  name: string
  description?: string
  resource: string
  action: string
  created_at: string
  updated_at: string
}

export interface RolePermission {
  id: string
  role: string
  permission_id: string
  created_at: string
  updated_at: string
}

export interface VaultFile {
  id: string
  name: string
  original_name: string
  file_path: string
  file_size: number
  mime_type: string
  company_id: string
  uploaded_by: string
  folder_path?: string
  is_shared: boolean
  checksum: string
  created_at: string
  updated_at: string
}

export interface VaultShare {
  id: string
  file_id: string
  token: string
  expires_at?: string
  max_uses?: number
  view_count: number
  is_active: boolean
  created_by: string
  created_at: string
}

export interface VaultStats {
  total_files: number
  total_size: number
  shared_files: number
  recent_uploads: number
}