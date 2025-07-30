import { useState, useEffect, useCallback } from 'react'
import { microservicesClient, Permission, RolePermission } from '@/services/api/microservices'
import { toast } from 'sonner'

// Re-export types for convenience
export type { Permission, RolePermission } from '@/services/api/microservices'

interface UseApiPermissionsResult {
  permissions: Permission[]
  rolePermissions: RolePermission[]
  loading: boolean
  error: string | null
  
  // Permission management
  createPermission: (permission: Omit<Permission, 'id' | 'created_at' | 'updated_at'>) => Promise<{ success: boolean; error?: any }>
  updatePermission: (id: string, updates: Partial<Permission>) => Promise<{ success: boolean; error?: any }>
  deletePermission: (id: string) => Promise<{ success: boolean; error?: any }>
  
  // Role-Permission management
  assignPermissionToRole: (role: string, permissionId: string) => Promise<{ success: boolean; error?: any }>
  removePermissionFromRole: (role: string, permissionId: string) => Promise<{ success: boolean; error?: any }>
  
  // Permission checking
  hasPermission: (permissionName: string) => Promise<boolean>
  getUserPermissions: () => Promise<Permission[]>
  
  // Utility
  refetch: () => Promise<void>
}

export function useApiPermissions(): UseApiPermissionsResult {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log('🔍 useApiPermissions: Hook initialized')

  const fetchPermissions = useCallback(async () => {
    try {
      console.log('🔍 useApiPermissions: Fetching permissions via API...')
      const response = await microservicesClient.getPermissions()
      console.log('🔍 useApiPermissions: API response for permissions:', response)
      setPermissions(response.permissions || [])
    } catch (error) {
      console.error('🔍 useApiPermissions: Error fetching permissions:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch permissions')
      setPermissions([])
    }
  }, [])

  const fetchRolePermissions = useCallback(async () => {
    try {
      console.log('🔍 useApiPermissions: Fetching role permissions via API...')
      const response = await microservicesClient.getRolePermissions()
      console.log('🔍 useApiPermissions: API response for role permissions:', response)
      setRolePermissions(response.rolePermissions || [])
    } catch (error) {
      console.error('🔍 useApiPermissions: Error fetching role permissions:', error)
      setError(error instanceof Error ? error.message : 'Failed to fetch role permissions')
      setRolePermissions([])
    }
  }, [])

  const refetch = useCallback(async () => {
    console.log('🔍 useApiPermissions: Refetching data...')
    setLoading(true)
    setError(null)
    
    try {
      await Promise.all([fetchPermissions(), fetchRolePermissions()])
    } finally {
      setLoading(false)
    }
  }, [fetchPermissions, fetchRolePermissions])

  // Initial data loading
  useEffect(() => {
    console.log('🔍 useApiPermissions: Initial load triggered')
    refetch()
  }, [refetch])

  const createPermission = useCallback(async (permissionData: Omit<Permission, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log('🔍 useApiPermissions: Creating permission:', permissionData)
      const response = await microservicesClient.createPermission(permissionData)
      console.log('🔍 useApiPermissions: Permission created:', response)
      
      // Refresh permissions list
      await fetchPermissions()
      toast.success('Permission created successfully')
      
      return { success: true }
    } catch (error) {
      console.error('🔍 useApiPermissions: Error creating permission:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to create permission'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [fetchPermissions])

  const updatePermission = useCallback(async (id: string, updates: Partial<Permission>) => {
    try {
      console.log('🔍 useApiPermissions: Updating permission:', id, updates)
      const response = await microservicesClient.updatePermission(id, updates)
      console.log('🔍 useApiPermissions: Permission updated:', response)
      
      // Refresh permissions list
      await fetchPermissions()
      toast.success('Permission updated successfully')
      
      return { success: true }
    } catch (error) {
      console.error('🔍 useApiPermissions: Error updating permission:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update permission'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [fetchPermissions])

  const deletePermission = useCallback(async (id: string) => {
    try {
      console.log('🔍 useApiPermissions: Deleting permission:', id)
      await microservicesClient.deletePermission(id)
      console.log('🔍 useApiPermissions: Permission deleted')
      
      // Refresh permissions list
      await fetchPermissions()
      toast.success('Permission deleted successfully')
      
      return { success: true }
    } catch (error) {
      console.error('🔍 useApiPermissions: Error deleting permission:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete permission'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [fetchPermissions])

  const assignPermissionToRole = useCallback(async (role: string, permissionId: string) => {
    try {
      console.log('🔍 useApiPermissions: Assigning permission to role:', { role, permissionId })
      const response = await microservicesClient.assignPermissionToRole({ role, permission_id: permissionId })
      console.log('🔍 useApiPermissions: Permission assigned to role:', response)
      
      // Refresh role permissions list
      await fetchRolePermissions()
      toast.success('Permission assigned to role successfully')
      
      return { success: true }
    } catch (error) {
      console.error('🔍 useApiPermissions: Error assigning permission to role:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to assign permission to role'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [fetchRolePermissions])

  const removePermissionFromRole = useCallback(async (role: string, permissionId: string) => {
    try {
      console.log('🔍 useApiPermissions: Removing permission from role:', { role, permissionId })
      
      // Find the role permission record to delete
      const rolePermission = rolePermissions.find(rp => rp.role === role && rp.permission_id === permissionId)
      if (!rolePermission) {
        throw new Error('Role permission not found')
      }
      
      await microservicesClient.removePermissionFromRole(rolePermission.id)
      console.log('🔍 useApiPermissions: Permission removed from role')
      
      // Refresh role permissions list
      await fetchRolePermissions()
      toast.success('Permission removed from role successfully')
      
      return { success: true }
    } catch (error) {
      console.error('🔍 useApiPermissions: Error removing permission from role:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to remove permission from role'
      toast.error(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [rolePermissions, fetchRolePermissions])

  const hasPermission = useCallback(async (permissionName: string): Promise<boolean> => {
    try {
      console.log('🔍 useApiPermissions: Checking permission:', permissionName)
      const response = await microservicesClient.checkPermission(permissionName)
      console.log('🔍 useApiPermissions: Permission check result:', response)
      return response.hasPermission || false
    } catch (error) {
      console.error('🔍 useApiPermissions: Error checking permission:', error)
      return false
    }
  }, [])

  const getUserPermissions = useCallback(async (): Promise<Permission[]> => {
    try {
      console.log('🔍 useApiPermissions: Getting user permissions')
      const response = await microservicesClient.getUserPermissions()
      console.log('🔍 useApiPermissions: User permissions:', response)
      return response.permissions || []
    } catch (error) {
      console.error('🔍 useApiPermissions: Error getting user permissions:', error)
      return []
    }
  }, [])

  return {
    permissions,
    rolePermissions,
    loading,
    error,
    createPermission,
    updatePermission,
    deletePermission,
    assignPermissionToRole,
    removePermissionFromRole,
    hasPermission,
    getUserPermissions,
    refetch,
  }
}