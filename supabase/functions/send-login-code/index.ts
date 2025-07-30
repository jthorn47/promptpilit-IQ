import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getResendClient } from '../_shared/resend-client.ts'

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

    // Check if user has email method enabled
    const { data: settings, error: settingsError } = await supabaseClient
      .from('user_2fa_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (settingsError || !settings || settings.method !== 'email') {
      return new Response(
        JSON.stringify({ error: 'Email authentication not enabled for this user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate 6-digit login code
    const { data: codeData, error: codeError } = await supabaseClient
      .rpc('generate_six_digit_code')

    if (codeError) {
      console.error('Error generating code:', codeError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate login code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const loginCode = codeData
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Store login code
    const { error: updateError } = await supabaseClient
      .from('user_2fa_settings')
      .update({
        email_code: loginCode,
        email_code_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Database error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to store login code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send login code email
    try {
      const resend = await getResendClient()
      
      const emailResponse = await resend.emails.send({
        from: 'EaseLearn <notifications@easelearn.com>',
        to: [user.email!],
        subject: 'Your Secure Login Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #655DC6; text-align: center;">Your Login Code</h1>
            <p>Here's your secure login code:</p>
            
            <div style="background: #f8f9fa; border: 2px solid #655DC6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h2 style="color: #655DC6; font-size: 32px; letter-spacing: 4px; margin: 0;">${loginCode}</h2>
            </div>
            
            <p><strong>This code expires in 10 minutes.</strong></p>
            <p>If you didn't request this code, please contact support immediately.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
              This email was sent from EaseLearn. Please do not reply to this email.
            </div>
          </div>
        `,
      })

      console.log('Login code email sent:', emailResponse)
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Login code sent to your email'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-login-code:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})