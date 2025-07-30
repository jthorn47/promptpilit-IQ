import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as OTPAuth from 'https://esm.sh/otpauth@9.2.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { token, isLogin = false, backupCode = null, method = 'totp' } = await req.json()

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

    // Get user's 2FA settings
    const { data: settings, error: settingsError } = await supabaseClient
      .from('user_2fa_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ error: '2FA not set up' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let isValid = false

    if (backupCode) {
      // Verify backup code
      const backupCodes = settings.backup_codes || []
      const codeIndex = backupCodes.indexOf(backupCode)
      
      if (codeIndex !== -1) {
        isValid = true
        // Remove used backup code
        backupCodes.splice(codeIndex, 1)
        await supabaseClient
          .from('user_2fa_settings')
          .update({ 
            backup_codes: backupCodes,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
      }
    } else {
      // Verify TOTP token using OTPAuth
      try {
        const totp = new OTPAuth.TOTP({
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          secret: OTPAuth.Secret.fromBase32(settings.totp_secret),
        })
        
        const delta = totp.validate({ token, window: 1 })
        isValid = delta !== null
      } catch (error) {
        console.error('TOTP verification error:', error)
        isValid = false
      }
    }

    if (!isValid) {
      return new Response(
        JSON.stringify({ error: 'Invalid code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If this is the initial setup verification, enable secure auth and generate backup codes
    if (!settings.is_enabled && !isLogin) {
      const backupCodes = Array.from({ length: 10 }, () => 
        Math.random().toString(36).substring(2, 10).toUpperCase()
      )

      const { error: enableError } = await supabaseClient
        .from('user_2fa_settings')
        .update({
          is_enabled: true,
          backup_codes: method === 'totp' ? backupCodes : null,
          method: method,
          is_activated: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)

      if (enableError) {
        return new Response(
          JSON.stringify({ error: 'Failed to enable 2FA' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          backupCodes: method === 'totp' ? backupCodes : null,
          message: 'Secure authentication enabled successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Code verified successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in verify-totp:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})