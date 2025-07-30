import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { code, isActivation = false } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user's settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('user_2fa_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsError) {
      console.error('Database error:', settingsError)
      return new Response(
        JSON.stringify({ error: 'User authentication settings not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let isValid = false
    let responseData: any = { success: false }

    if (isActivation) {
      // Verify activation code
      if (settings.activation_code === code && 
          settings.activation_expires_at && 
          new Date(settings.activation_expires_at) > new Date()) {
        
        isValid = true
        
        // Mark as activated and clear activation code
        const { error: updateError } = await supabaseClient
          .from('user_2fa_settings')
          .update({
            is_activated: true,
            activation_code: null,
            activation_expires_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Update error:', updateError)
          return new Response(
            JSON.stringify({ error: 'Failed to activate account' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        responseData = {
          success: true,
          message: 'Account activated successfully',
          needsSecuritySetup: true
        }
      }
    } else {
      // Verify login code for email authentication
      if (settings.method === 'email' &&
          settings.email_code === code && 
          settings.email_code_expires_at && 
          new Date(settings.email_code_expires_at) > new Date()) {
        
        isValid = true
        
        // Clear used email code
        const { error: updateError } = await supabaseClient
          .from('user_2fa_settings')
          .update({
            email_code: null,
            email_code_expires_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)

        if (updateError) {
          console.error('Update error:', updateError)
        }

        responseData = {
          success: true,
          message: 'Login code verified successfully'
        }
      }
    }

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in verify-email-code:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})