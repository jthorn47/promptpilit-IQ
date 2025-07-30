import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuthzRequest {
  action: 'check_permission' | 'get_user_roles' | 'get_user_permissions' | 'assign_role' | 'remove_role' | 'get_roles' | 'get_permissions' | 'create_permission' | 'update_permission' | 'delete_permission' | 'assign_permission_to_role' | 'remove_permission_from_role'
  userId?: string
  role?: string
  permission?: string
  resource?: string
  permissionData?: any
  permissionId?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the token and get user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { action, userId, role, permission, resource, permissionData, permissionId }: AuthzRequest = await req.json()

    switch (action) {
      case 'check_permission':
        return await checkPermission(supabaseClient, userId!, permission!, resource)
      
      case 'get_user_roles':
        return await getUserRoles(supabaseClient, userId!)
      
      case 'get_user_permissions':
        return await getUserPermissions(supabaseClient, userId!)
      
      case 'assign_role':
        return await assignRole(supabaseClient, userId!, role!)
      
      case 'remove_role':
        return await removeRole(supabaseClient, userId!, role!)
      
      case 'get_roles':
        return await getRoles(supabaseClient)
      
      case 'get_permissions':
        return await getPermissions(supabaseClient)
      
      case 'create_permission':
        return await createPermission(supabaseClient, permissionData)
      
      case 'update_permission':
        return await updatePermission(supabaseClient, permissionId!, permissionData)
      
      case 'delete_permission':
        return await deletePermission(supabaseClient, permissionId!)
      
      case 'assign_permission_to_role':
        return await assignPermissionToRole(supabaseClient, role!, permissionId!)
      
      case 'remove_permission_from_role':
        return await removePermissionFromRole(supabaseClient, role!, permissionId!)
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function checkPermission(supabase: any, userId: string, permission: string, resource?: string) {
  // Get user roles
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)

  if (!userRoles?.length) {
    return new Response(JSON.stringify({ hasPermission: false }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Check if user has super_admin role (grants all permissions)
  if (userRoles.some((ur: any) => ur.role === 'super_admin')) {
    return new Response(JSON.stringify({ hasPermission: true, reason: 'super_admin' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  // Check role permissions
  const roles = userRoles.map((ur: any) => ur.role)
  let query = supabase
    .from('role_permissions')
    .select(`
      permission:permissions(name, resource, action)
    `)
    .in('role', roles)

  const { data: rolePermissions } = await query

  const hasPermission = rolePermissions?.some((rp: any) => {
    const perm = rp.permission
    if (resource) {
      return perm.name === permission && perm.resource === resource
    }
    return perm.name === permission
  })

  return new Response(JSON.stringify({ hasPermission: hasPermission || false }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getUserRoles(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .select('role, company_id')
    .eq('user_id', userId)

  return new Response(JSON.stringify({ data, error }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getUserPermissions(supabase: any, userId: string) {
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)

  if (!userRoles?.length) {
    return new Response(JSON.stringify({ data: [], error: null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  const roles = userRoles.map((ur: any) => ur.role)
  const { data, error } = await supabase
    .from('role_permissions')
    .select(`
      permission:permissions(*)
    `)
    .in('role', roles)

  const permissions = data?.map((rp: any) => rp.permission) || []

  return new Response(JSON.stringify({ data: permissions, error }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function assignRole(supabase: any, userId: string, role: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role })
    .select()

  return new Response(JSON.stringify({ data, error }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function removeRole(supabase: any, userId: string, role: string) {
  const { data, error } = await supabase
    .from('user_roles')
    .delete()
    .eq('user_id', userId)
    .eq('role', role)

  return new Response(JSON.stringify({ data, error }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getRoles(supabase: any) {
  // Get distinct roles from user_roles table
  const { data, error } = await supabase
    .rpc('get_distinct_roles')

  return new Response(JSON.stringify({ data, error }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function getPermissions(supabase: any) {
  const { data, error } = await supabase
    .from('permissions')
    .select('*')
    .order('resource', { ascending: true })

  return new Response(JSON.stringify({ data, error }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function createPermission(supabase: any, permissionData: any) {
  const { data, error } = await supabase
    .from('permissions')
    .insert(permissionData)
    .select()

  return new Response(JSON.stringify({ data, error }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function updatePermission(supabase: any, permissionId: string, permissionData: any) {
  const { data, error } = await supabase
    .from('permissions')
    .update(permissionData)
    .eq('id', permissionId)
    .select()

  return new Response(JSON.stringify({ data, error }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function deletePermission(supabase: any, permissionId: string) {
  // First remove all role assignments
  await supabase
    .from('role_permissions')
    .delete()
    .eq('permission_id', permissionId)

  // Then delete the permission
  const { data, error } = await supabase
    .from('permissions')
    .delete()
    .eq('id', permissionId)

  return new Response(JSON.stringify({ data, error }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function assignPermissionToRole(supabase: any, role: string, permissionId: string) {
  const { data, error } = await supabase
    .from('role_permissions')
    .insert({ role, permission_id: permissionId })
    .select()

  return new Response(JSON.stringify({ data, error }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function removePermissionFromRole(supabase: any, role: string, permissionId: string) {
  const { data, error } = await supabase
    .from('role_permissions')
    .delete()
    .eq('role', role)
    .eq('permission_id', permissionId)

  return new Response(JSON.stringify({ data, error }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}