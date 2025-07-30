import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

// Generate secure hash for tokens
async function generateTokenHash(userId: string, moduleId: string, timestamp: number): Promise<string> {
  const data = `${userId}-${moduleId}-${timestamp}-${Deno.env.get('SUPABASE_JWT_SECRET')}`
  const encoder = new TextEncoder()
  const dataBuffer = encoder.encode(data)
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Get client IP address from request
function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  
  return cfConnectingIP || realIP || forwardedFor?.split(',')[0] || 'unknown'
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { action, ...payload } = await req.json()
    const authHeader = req.headers.get('Authorization')
    const userAgent = req.headers.get('User-Agent') || 'unknown'
    const clientIP = getClientIP(req)

    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Get user from auth token
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    console.log(`🔐 Secure video access request: ${action} for user ${user.id}`)

    switch (action) {
      case 'unlock_course': {
        const { trainingModuleId } = payload

        // Check if user has available seats
        const { data: seatData, error: seatError } = await supabase
          .from('user_course_seats')
          .select('id, total_seats, used_seats, remaining_seats')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .gt('remaining_seats', 0)
          .order('purchased_at', { ascending: true })
          .limit(1)

        if (seatError || !seatData || seatData.length === 0) {
          throw new Error('No available seats found')
        }

        const seatPackage = seatData[0]

        // Check if course is already unlocked
        const { data: existingAccess } = await supabase
          .from('user_course_access')
          .select('id')
          .eq('user_id', user.id)
          .eq('training_module_id', trainingModuleId)
          .eq('status', 'active')

        if (existingAccess && existingAccess.length > 0) {
          throw new Error('Course already unlocked')
        }

        // Start transaction
        const { data: accessData, error: accessError } = await supabase
          .from('user_course_access')
          .insert({
            user_id: user.id,
            training_module_id: trainingModuleId,
            seat_package_id: seatPackage.id,
            ip_address: clientIP,
            user_agent: userAgent
          })
          .select()

        if (accessError) {
          throw new Error(`Failed to unlock course: ${accessError.message}`)
        }

        // Update seat count
        const { error: updateError } = await supabase
          .from('user_course_seats')
          .update({ 
            used_seats: seatPackage.used_seats + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', seatPackage.id)

        if (updateError) {
          throw new Error(`Failed to update seat count: ${updateError.message}`)
        }

        // Log audit event
        await supabase
          .from('video_security_audit')
          .insert({
            user_id: user.id,
            training_module_id: trainingModuleId,
            event_type: 'course_unlock',
            event_details: {
              seat_package_id: seatPackage.id,
              remaining_seats: seatPackage.remaining_seats - 1
            },
            ip_address: clientIP,
            user_agent: userAgent
          })

        return new Response(
          JSON.stringify({
            success: true,
            message: 'Course unlocked successfully',
            remaining_seats: seatPackage.remaining_seats - 1
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'generate_video_token': {
        const { trainingModuleId } = payload

        // Verify user has access to this course
        const { data: accessData, error: accessError } = await supabase
          .from('user_course_access')
          .select('id, last_accessed_at')
          .eq('user_id', user.id)
          .eq('training_module_id', trainingModuleId)
          .eq('status', 'active')

        if (accessError || !accessData || accessData.length === 0) {
          throw new Error('Access denied: Course not unlocked')
        }

        // Check for existing active sessions (prevent simultaneous access)
        const { data: existingSessions } = await supabase
          .from('user_video_sessions')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString())

        // Deactivate existing sessions
        if (existingSessions && existingSessions.length > 0) {
          await supabase
            .from('user_video_sessions')
            .update({ is_active: false })
            .eq('user_id', user.id)
            .eq('is_active', true)
        }

        // Generate new session
        const sessionToken = crypto.randomUUID()
        const sessionExpiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000) // 8 hours

        await supabase
          .from('user_video_sessions')
          .insert({
            user_id: user.id,
            session_token: sessionToken,
            ip_address: clientIP,
            user_agent: userAgent,
            expires_at: sessionExpiresAt.toISOString()
          })

        // Generate video access token
        const timestamp = Date.now()
        const tokenHash = await generateTokenHash(user.id, trainingModuleId, timestamp)
        const tokenExpiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours

        const { data: tokenData, error: tokenError } = await supabase
          .from('video_access_tokens')
          .insert({
            token_hash: tokenHash,
            user_id: user.id,
            training_module_id: trainingModuleId,
            ip_address: clientIP,
            user_agent: userAgent,
            expires_at: tokenExpiresAt.toISOString()
          })
          .select()

        if (tokenError) {
          throw new Error(`Failed to generate token: ${tokenError.message}`)
        }

        // Update last accessed time
        await supabase
          .from('user_course_access')
          .update({ 
            last_accessed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
          .eq('training_module_id', trainingModuleId)

        // Log audit event
        await supabase
          .from('video_security_audit')
          .insert({
            user_id: user.id,
            training_module_id: trainingModuleId,
            event_type: 'token_generated',
            event_details: {
              token_expires_at: tokenExpiresAt.toISOString(),
              session_token: sessionToken
            },
            ip_address: clientIP,
            user_agent: userAgent
          })

        return new Response(
          JSON.stringify({
            success: true,
            video_token: tokenHash,
            session_token: sessionToken,
            expires_at: tokenExpiresAt.toISOString(),
            watermark_data: {
              user_email: user.email,
              user_id: user.id
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'validate_token': {
        const { token, moduleId } = payload

        // Verify token
        const { data: tokenData, error: tokenError } = await supabase
          .from('video_access_tokens')
          .select('*')
          .eq('token_hash', token)
          .eq('training_module_id', moduleId)
          .eq('is_used', false)
          .gt('expires_at', new Date().toISOString())

        if (tokenError || !tokenData || tokenData.length === 0) {
          throw new Error('Invalid or expired token')
        }

        const tokenRecord = tokenData[0]

        // Verify IP and user
        if (tokenRecord.user_id !== user.id) {
          throw new Error('Token user mismatch')
        }

        if (tokenRecord.ip_address !== clientIP) {
          // Log suspicious activity
          await supabase
            .from('video_security_audit')
            .insert({
              user_id: user.id,
              training_module_id: moduleId,
              event_type: 'suspicious_activity',
              event_details: {
                reason: 'IP address mismatch',
                token_ip: tokenRecord.ip_address,
                current_ip: clientIP,
                token_hash: token
              },
              ip_address: clientIP,
              user_agent: userAgent,
              risk_score: 75
            })

          throw new Error('Token IP mismatch - suspicious activity detected')
        }

        // Mark token as used
        await supabase
          .from('video_access_tokens')
          .update({ 
            is_used: true, 
            used_at: new Date().toISOString() 
          })
          .eq('id', tokenRecord.id)

        // Log access event
        await supabase
          .from('video_security_audit')
          .insert({
            user_id: user.id,
            training_module_id: moduleId,
            event_type: 'video_access',
            event_details: {
              token_hash: token,
              video_position: tokenRecord.video_position_seconds
            },
            ip_address: clientIP,
            user_agent: userAgent
          })

        return new Response(
          JSON.stringify({
            success: true,
            valid: true,
            user_email: user.email,
            video_position: tokenRecord.video_position_seconds
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'get_user_seats': {
        const { data: seatsData, error: seatsError } = await supabase
          .from('user_course_seats')
          .select(`
            id,
            total_seats,
            used_seats,
            remaining_seats,
            purchased_at,
            status,
            expires_at,
            course_packages(name, description, course_count)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('purchased_at', { ascending: false })

        if (seatsError) {
          throw new Error(`Failed to get seats: ${seatsError.message}`)
        }

        const { data: accessData, error: accessError } = await supabase
          .from('user_course_access')
          .select(`
            id,
            training_module_id,
            unlocked_at,
            last_accessed_at,
            certificate_generated,
            training_modules(title, description, thumbnail_url, estimated_duration)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('unlocked_at', { ascending: false })

        if (accessError) {
          throw new Error(`Failed to get access: ${accessError.message}`)
        }

        return new Response(
          JSON.stringify({
            success: true,
            seats: seatsData || [],
            unlocked_courses: accessData || []
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error('Invalid action')
    }

  } catch (error) {
    console.error('🚨 Secure video access error:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})