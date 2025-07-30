import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface User {
  id: string
  email: string
  created_at: string
  updated_at: string
  company_id?: string
  completed_tours: string[]
  is_employee: boolean
}

interface UserRole {
  id: string
  user_id: string
  role: string
  company_id?: string
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
    // Extract path after /functions/v1/user-service/
    const fullPath = url.pathname
    const functionBase = '/functions/v1/user-service/'
    const path = fullPath.startsWith(functionBase) 
      ? fullPath.substring(functionBase.length)
      : fullPath.split('/').slice(-3).join('/') // Fallback: get last 3 segments
    const method = req.method

    console.log(`🔧 User Service: ${method} ${path}`)
    console.log(`🔧 Full URL: ${req.url}`)
    console.log(`🔧 Full Path: ${fullPath}`)
    console.log(`🔧 Extracted Path: ${path}`)

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
      case method === 'GET' && path === 'users/me':
        return await handleGetCurrentUser(user.id)
      
      case method === 'GET' && path.startsWith('users/') && path.endsWith('/roles'):
        const userId = path.split('/')[1]
        return await handleGetUserRoles(userId, user.id)
      
      case method === 'GET' && path.startsWith('users/'):
        const targetUserId = path.split('/')[1]
        return await handleGetUser(targetUserId, user.id)
      
      case method === 'POST' && path === 'users':
        const userData = await req.json()
        return await handleCreateUser(userData, user.id)
      
      case method === 'PUT' && path.startsWith('users/'):
        const updateUserId = path.split('/')[1]
        const updateData = await req.json()
        return await handleUpdateUser(updateUserId, updateData, user.id)
      
      case method === 'POST' && path.endsWith('/roles'):
        const assignUserId = path.split('/')[1]
        const roleData = await req.json()
        return await handleAssignRole(assignUserId, roleData, user.id)
      
      case method === 'DELETE' && path.includes('/roles/'):
        const [, removeUserId, , roleId] = path.split('/')
        return await handleRemoveRole(removeUserId, roleId, user.id)
      
      default:
        return new Response(
          JSON.stringify({ error: 'Route not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('🚨 User Service Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function handleGetCurrentUser(userId: string) {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return new Response(
      JSON.stringify({ error: 'User profile not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ user: profile }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetUser(targetUserId: string, requestingUserId: string) {
  // Check if requesting user has permission to view other users
  const { data: requestingUserRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', requestingUserId)

  const hasAdminRole = requestingUserRoles?.some(r => 
    ['super_admin', 'company_admin', 'admin'].includes(r.role)
  )

  if (!hasAdminRole && targetUserId !== requestingUserId) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: user, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', targetUserId)
    .single()

  if (error) {
    return new Response(
      JSON.stringify({ error: 'User not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ user }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleGetUserRoles(userId: string, requestingUserId: string) {
  // Check permissions
  const { data: requestingUserRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', requestingUserId)

  const hasAdminRole = requestingUserRoles?.some(r => 
    ['super_admin', 'company_admin', 'admin'].includes(r.role)
  )

  if (!hasAdminRole && userId !== requestingUserId) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: roles, error } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching user roles:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to fetch user roles' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ roles }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleCreateUser(userData: any, requestingUserId: string) {
  // Check if requesting user has admin permissions
  const { data: requestingUserRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', requestingUserId)

  const hasAdminRole = requestingUserRoles?.some(r => 
    ['super_admin', 'company_admin'].includes(r.role)
  )

  if (!hasAdminRole) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Create user in auth.users via Supabase Admin API
  const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: userData.password || 'temp_password_' + Math.random().toString(36),
    email_confirm: true
  })

  if (createError) {
    console.error('Error creating user:', createError)
    return new Response(
      JSON.stringify({ error: 'Failed to create user' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Create profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .insert({
      user_id: newUser.user.id,
      email: userData.email,
      company_id: userData.company_id || null,
      is_employee: userData.is_employee || false
    })
    .select()
    .single()

  if (profileError) {
    console.error('Error creating profile:', profileError)
    // Cleanup - delete the auth user
    await supabase.auth.admin.deleteUser(newUser.user.id)
    return new Response(
      JSON.stringify({ error: 'Failed to create user profile' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ user: profile }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleUpdateUser(userId: string, updateData: any, requestingUserId: string) {
  // Check permissions
  const { data: requestingUserRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', requestingUserId)

  const hasAdminRole = requestingUserRoles?.some(r => 
    ['super_admin', 'company_admin'].includes(r.role)
  )

  if (!hasAdminRole && userId !== requestingUserId) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: updatedUser, error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to update user' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ user: updatedUser }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleAssignRole(userId: string, roleData: any, requestingUserId: string) {
  // Check if requesting user has admin permissions
  const { data: requestingUserRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', requestingUserId)

  const hasAdminRole = requestingUserRoles?.some(r => 
    ['super_admin', 'company_admin'].includes(r.role)
  )

  if (!hasAdminRole) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { data: newRole, error } = await supabase
    .from('user_roles')
    .insert({
      user_id: userId,
      role: roleData.role,
      company_id: roleData.company_id || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error assigning role:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to assign role' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ role: newRole }),
    { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleRemoveRole(userId: string, roleId: string, requestingUserId: string) {
  // Check if requesting user has admin permissions
  const { data: requestingUserRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', requestingUserId)

  const hasAdminRole = requestingUserRoles?.some(r => 
    ['super_admin', 'company_admin'].includes(r.role)
  )

  if (!hasAdminRole) {
    return new Response(
      JSON.stringify({ error: 'Insufficient permissions' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const { error } = await supabase
    .from('user_roles')
    .delete()
    .eq('id', roleId)
    .eq('user_id', userId)

  if (error) {
    console.error('Error removing role:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to remove role' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}