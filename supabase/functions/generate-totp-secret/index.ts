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

    // Generate a new secret using OTPAuth
    const secret = new OTPAuth.Secret()
    
    // Get user email for the QR code label
    const userEmail = user.email || 'user'
    const issuer = 'EaseLearn'
    
    // Create TOTP instance and generate otpauth URL
    const totp = new OTPAuth.TOTP({
      issuer: issuer,
      label: userEmail,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret,
    })
    
    const otpauthUrl = totp.toString()

    // Store the secret in the database (encrypted by Supabase)
    const { error: dbError } = await supabaseClient
      .from('user_2fa_settings')
      .upsert({
        user_id: user.id,
        totp_secret: secret.base32,
        is_enabled: false, // Not enabled until verified
        backup_codes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Failed to store secret' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        secret: secret.base32,
        otpauthUrl,
        issuer,
        user: userEmail
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in generate-totp-secret:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})