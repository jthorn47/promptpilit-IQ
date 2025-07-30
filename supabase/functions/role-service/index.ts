import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface Permission {
  id: string
  name: string
  description?: string
  resource: string
  action: string
  created_at: string
  updated_at: string
}

interface RolePermission {
  id: string
  role: string
  permission_id: string
  created_at: string
  updated_at: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const path = url.pathname.split('/').slice(-2).join('/') // Get last 2 segments
    const method = req.method

    console.log(`🔐 Role Service: ${method} ${path}`)

    // Get auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.split(' ')[1]
    
    // Verify JWT token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route handling
    switch (true) {
      case method === 'GET' && path === 'roles':
        return await handleGetRoles(user.id)
      
      case method === 'POST' && path === 'roles':
        const roleData = await req.json()
        return await handleCreateRole(roleData, user.id)
      
      case method === 'GET' && path === 'permissions':
        return await handleGetPermissions(user.id)
      
      case method === 'POST' && path === 'permissions':
        const permissionData = await req.json()
        return await handleCreatePermission(permissionData, user.id)
      
      case method === 'PUT' && path.startsWith('permissions/'):
        const permissionId = path.split('/')[1]
        const updateData = await req.json()
        return await handleUpdatePermission(permissionId, updateData, user.id)
      
      case method === 'DELETE' && path.startsWith('permissions/'):
        const deletePermissionId = path.split('/')[1]
        return await handleDeletePermission(deletePermissionId, user.id)
      
      case method === 'GET' && path === 'role-permissions':
        return await handleGetRolePermissions(user.id)
      
      case method === 'POST' && path === 'role-permissions':
        const rolePermissionData = await req.json()
        return await handleAssignPermissionToRole(rolePermissionData, user.id)
      
      case method === 'DELETE' && path.startsWith('role-permissions/'):
        const rolePermissionId = path.split('/')[1]
        return await handleRemovePermissionFromRole(rolePermissionId, user.id)
      
      case method === 'GET' && path.startsWith('users/') && path.endsWith('/permissions'):
        const userId = path.split('/')[1]
        return await handleGetUserPermissions(userId, user.id)
      
      case method === 'POST' && path === 'permissions/check':
        const checkData = await req.json()
        return await handleCheckPermission(checkData, user.id)
      
      case method === 'POST' && path === 'permissions/bulk-check':
        const bulkCheckData = await req.json()
        return await handleBulkCheckPermissions(bulkCheckData, user.id)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Route not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('🚨 Role Service Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function checkUserPermissions(userId: string) {
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)

  return {
    hasAdminRole: userRoles?.some(r => ['super_admin', 'company_admin', 'admin'].includes(r.role)),
    hasSuperAdminRole: userRoles?.some(r => r.role === 'super_admin'),
    roles: userRoles?.map(r => r.role) || []
  }
}

async function handleGetRoles(userId: string) {
  const userPerms = await checkUserPermissions(userId)
  
  if (!userPerms.hasAdminRole) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get distinct roles from user_roles table
  const { data: roles, error } = await supabase
    .from('user_roles')
    .select('role')
    .order('role')

  if (error) {
    console.error('Error fetching roles:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch roles' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get unique roles
  const uniqueRoles = [...new Set(roles?.map(r => r.role) || [])]
  
  return new Response(
    JSON.stringify({ roles: uniqueRoles }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCreateRole(roleData: any, userId: string) {
  const userPerms = await checkUserPermissions(userId)
  
  if (!userPerms.hasSuperAdminRole) {
    return new Response(
      JSON.stringify({ error: 'Only super admins can create roles' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // For now, we'll just return success since roles are managed through user_roles table
  // In a full implementation, you might have a separate roles table
  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Role creation acknowledged. Roles are managed through user assignments.' 
    }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetPermissions(userId: string) {
  const userPerms = await checkUserPermissions(userId)
  
  if (!userPerms.hasAdminRole) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: permissions, error } = await supabase
    .from('permissions')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching permissions:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch permissions' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ permissions }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCreatePermission(permissionData: any, userId: string) {
  const userPerms = await checkUserPermissions(userId)
  
  if (!userPerms.hasSuperAdminRole) {
    return new Response(
      JSON.stringify({ error: 'Only super admins can create permissions' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: permission, error } = await supabase
    .from('permissions')
    .insert({
      name: permissionData.name,
      description: permissionData.description || null,
      resource: permissionData.resource || 'general',
      action: permissionData.action || 'read'
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating permission:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to create permission' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ permission }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUpdatePermission(permissionId: string, updateData: any, userId: string) {
  const userPerms = await checkUserPermissions(userId)
  
  if (!userPerms.hasSuperAdminRole) {
    return new Response(
      JSON.stringify({ error: 'Only super admins can update permissions' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: permission, error } = await supabase
    .from('permissions')
    .update(updateData)
    .eq('id', permissionId)
    .select()
    .single()

  if (error) {
    console.error('Error updating permission:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update permission' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ permission }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleDeletePermission(permissionId: string, userId: string) {
  const userPerms = await checkUserPermissions(userId)
  
  if (!userPerms.hasSuperAdminRole) {
    return new Response(
      JSON.stringify({ error: 'Only super admins can delete permissions' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { error } = await supabase
    .from('permissions')
    .delete()
    .eq('id', permissionId)

  if (error) {
    console.error('Error deleting permission:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to delete permission' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetRolePermissions(userId: string) {
  const userPerms = await checkUserPermissions(userId)
  
  if (!userPerms.hasAdminRole) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: rolePermissions, error } = await supabase
    .from('role_permissions')
    .select('*')
    .order('role')

  if (error) {
    console.error('Error fetching role permissions:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch role permissions' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ rolePermissions }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleAssignPermissionToRole(rolePermissionData: any, userId: string) {
  const userPerms = await checkUserPermissions(userId)
  
  if (!userPerms.hasSuperAdminRole) {
    return new Response(
      JSON.stringify({ error: 'Only super admins can assign permissions to roles' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: rolePermission, error } = await supabase
    .from('role_permissions')
    .insert({
      role: rolePermissionData.role,
      permission_id: rolePermissionData.permission_id
    })
    .select()
    .single()

  if (error) {
    console.error('Error assigning permission to role:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to assign permission to role' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ rolePermission }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleRemovePermissionFromRole(rolePermissionId: string, userId: string) {
  const userPerms = await checkUserPermissions(userId)
  
  if (!userPerms.hasSuperAdminRole) {
    return new Response(
      JSON.stringify({ error: 'Only super admins can remove permissions from roles' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { error } = await supabase
    .from('role_permissions')
    .delete()
    .eq('id', rolePermissionId)

  if (error) {
    console.error('Error removing permission from role:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to remove permission from role' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetUserPermissions(targetUserId: string, requestingUserId: string) {
  const userPerms = await checkUserPermissions(requestingUserId)
  
  // Allow users to check their own permissions, or admins to check others
  if (!userPerms.hasAdminRole && targetUserId !== requestingUserId) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get user's roles
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', targetUserId)

  if (rolesError) {
    console.error('Error fetching user roles:', rolesError)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch user roles' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get permissions for those roles
  const roles = userRoles?.map(r => r.role) || []
  
  if (roles.length === 0) {
    return new Response(
      JSON.stringify({ permissions: [] }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: rolePermissions, error: permissionsError } = await supabase
    .from('role_permissions')
    .select('permission_id, permissions(*)')
    .in('role', roles)

  if (permissionsError) {
    console.error('Error fetching role permissions:', permissionsError)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch permissions' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Flatten permissions
  const permissions = rolePermissions?.map(rp => rp.permissions).filter(Boolean) || []
  
  return new Response(
    JSON.stringify({ permissions }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCheckPermission(checkData: any, userId: string) {
  const { user_id: targetUserId, permission_name: permissionName } = checkData
  
  // Get user's roles
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', targetUserId || userId)

  if (rolesError) {
    console.error('Error fetching user roles:', rolesError)
    return new Response(
      JSON.stringify({ hasPermission: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const roles = userRoles?.map(r => r.role) || []
  
  // Super admin has all permissions
  if (roles.includes('super_admin')) {
    return new Response(
      JSON.stringify({ hasPermission: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Check if any of the user's roles have the required permission
  const { data: rolePermissions, error: permissionsError } = await supabase
    .from('role_permissions')
    .select('permissions(name)')
    .in('role', roles)

  if (permissionsError) {
    console.error('Error checking permissions:', permissionsError)
    return new Response(
      JSON.stringify({ hasPermission: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const hasPermission = rolePermissions?.some(rp => 
    rp.permissions?.name === permissionName
  ) || false

  return new Response(
    JSON.stringify({ hasPermission }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleBulkCheckPermissions(bulkCheckData: any, userId: string) {
  const { user_id: targetUserId, permissions: permissionNames } = bulkCheckData
  
  // Get user's roles
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', targetUserId || userId)

  if (rolesError) {
    console.error('Error fetching user roles:', rolesError)
    const results = permissionNames.reduce((acc: any, name: string) => {
      acc[name] = false
      return acc
    }, {})
    return new Response(
      JSON.stringify({ permissions: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const roles = userRoles?.map(r => r.role) || []
  
  // Super admin has all permissions
  if (roles.includes('super_admin')) {
    const results = permissionNames.reduce((acc: any, name: string) => {
      acc[name] = true
      return acc
    }, {})
    return new Response(
      JSON.stringify({ permissions: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Get all permissions for user's roles
  const { data: rolePermissions, error: permissionsError } = await supabase
    .from('role_permissions')
    .select('permissions(name)')
    .in('role', roles)

  if (permissionsError) {
    console.error('Error checking permissions:', permissionsError)
    const results = permissionNames.reduce((acc: any, name: string) => {
      acc[name] = false
      return acc
    }, {})
    return new Response(
      JSON.stringify({ permissions: results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const userPermissionNames = rolePermissions?.map(rp => rp.permissions?.name).filter(Boolean) || []
  
  const results = permissionNames.reduce((acc: any, name: string) => {
    acc[name] = userPermissionNames.includes(name)
    return acc
  }, {})

  return new Response(
    JSON.stringify({ permissions: results }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}