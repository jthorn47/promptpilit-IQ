import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AuthUser {
  id: string
  email?: string
  raw_user_meta_data?: {
    first_name?: string
    last_name?: string
    full_name?: string
    company_id?: string
    role?: string
  }
  created_at: string
}

interface CompanyUser {
  user_id: string
  company_id: string
  role?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin access
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting user profile sync process...')

    // Get all auth users that don't have profiles
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('id, email, raw_user_meta_data, created_at')
      .is('deleted_at', null)

    if (authError) {
      console.error('Error fetching auth users:', authError)
      throw authError
    }

    console.log(`Found ${authUsers?.length || 0} auth users`)

    // Get existing profile IDs to avoid duplicates
    const { data: existingProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('id')

    if (profilesError) {
      console.error('Error fetching existing profiles:', profilesError)
      throw profilesError
    }

    const existingProfileIds = new Set(existingProfiles?.map(p => p.id) || [])
    console.log(`Found ${existingProfileIds.size} existing profiles`)

    // Filter users that need profiles created
    const usersNeedingProfiles = authUsers?.filter(user => !existingProfileIds.has(user.id)) || []
    console.log(`${usersNeedingProfiles.length} users need profiles created`)

    if (usersNeedingProfiles.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'All users already have profiles',
          synced: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get company associations from employees table
    const { data: employeeAssociations, error: empError } = await supabase
      .from('employees')
      .select('user_id, company_id')
      .in('user_id', usersNeedingProfiles.map(u => u.id))

    if (empError) {
      console.error('Error fetching employee associations:', empError)
    }

    const employeeCompanyMap = new Map<string, string>()
    employeeAssociations?.forEach(emp => {
      if (emp.user_id && emp.company_id) {
        employeeCompanyMap.set(emp.user_id, emp.company_id)
      }
    })

    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Process each user
    for (const user of usersNeedingProfiles) {
      try {
        console.log(`Processing user ${user.id} (${user.email})`)

        // Extract name information
        const metadata = user.raw_user_meta_data || {}
        const firstName = metadata.first_name || ''
        const lastName = metadata.last_name || ''
        const fullName = metadata.full_name || `${firstName} ${lastName}`.trim() || user.email?.split('@')[0] || 'User'

        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            email: user.email,
            first_name: firstName,
            last_name: lastName,
            full_name: fullName,
            created_at: user.created_at,
            updated_at: new Date().toISOString()
          })

        if (profileError) {
          console.error(`Error creating profile for user ${user.id}:`, profileError)
          errors.push(`Profile creation failed for ${user.email}: ${profileError.message}`)
          errorCount++
          continue
        }

        // Determine company and role
        let companyId = metadata.company_id || employeeCompanyMap.get(user.id)
        let defaultRole = metadata.role || 'employee'

        // If user has company association, create user_roles entry
        if (companyId) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: defaultRole,
              company_id: companyId
            })

          if (roleError) {
            console.error(`Error creating role for user ${user.id}:`, roleError)
            errors.push(`Role creation failed for ${user.email}: ${roleError.message}`)
          } else {
            console.log(`Created role ${defaultRole} for user ${user.id} in company ${companyId}`)
          }
        } else {
          // Create role without company association (for super admins, etc.)
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: defaultRole
            })

          if (roleError) {
            console.error(`Error creating role for user ${user.id}:`, roleError)
            errors.push(`Role creation failed for ${user.email}: ${roleError.message}`)
          } else {
            console.log(`Created role ${defaultRole} for user ${user.id} (no company)`)
          }
        }

        successCount++
        console.log(`Successfully processed user ${user.id}`)

      } catch (error) {
        console.error(`Unexpected error processing user ${user.id}:`, error)
        errors.push(`Unexpected error for ${user.email}: ${error.message}`)
        errorCount++
      }
    }

    const result = {
      success: true,
      message: `Sync completed. ${successCount} profiles created, ${errorCount} errors`,
      synced: successCount,
      errors: errorCount,
      errorDetails: errors.length > 0 ? errors : undefined
    }

    console.log('Sync process completed:', result)

    return new Response(
      JSON.stringify(result),
      { 
        status: errors.length > 0 ? 207 : 200, // 207 Multi-Status if there were some errors
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Fatal error in sync process:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Sync process failed', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})