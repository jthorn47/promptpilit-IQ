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
    const { email } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Generate 6-digit activation code
    const { data: codeData, error: codeError } = await supabaseClient
      .rpc('generate_six_digit_code')

    if (codeError) {
      console.error('Error generating code:', codeError)
      return new Response(
        JSON.stringify({ error: 'Failed to generate activation code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const activationCode = codeData
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Find user by email and store activation code
    const { data: userData, error: userError } = await supabaseClient.auth.admin.listUsers()
    
    if (userError) {
      console.error('Error finding user:', userError)
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const user = userData.users.find(u => u.email === email)
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Store activation code in user_2fa_settings
    const { error: updateError } = await supabaseClient
      .from('user_2fa_settings')
      .upsert({
        user_id: user.id,
        activation_code: activationCode,
        activation_expires_at: expiresAt.toISOString(),
        is_activated: false,
        is_enabled: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (updateError) {
      console.error('Database error:', updateError)
      return new Response(
        JSON.stringify({ error: 'Failed to store activation code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send activation email
    try {
      const resend = await getResendClient()
      
      const emailResponse = await resend.emails.send({
        from: 'EaseLearn <notifications@easelearn.com>',
        to: [email],
        subject: 'Activate Your Easeworks Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #655DC6; text-align: center;">Activate Your Account</h1>
            <p>Thank you for signing up! To complete your account setup, please use the activation code below:</p>
            
            <div style="background: #f8f9fa; border: 2px solid #655DC6; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
              <h2 style="color: #655DC6; font-size: 32px; letter-spacing: 4px; margin: 0;">${activationCode}</h2>
            </div>
            
            <p><strong>This code expires in 10 minutes.</strong></p>
            <p>If you didn't create this account, please ignore this email.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
              This email was sent from EaseLearn. Please do not reply to this email.
            </div>
          </div>
        `,
      })

      console.log('Activation email sent:', emailResponse)
    } catch (emailError) {
      console.error('Email sending error:', emailError)
      // Don't fail the request if email fails - user can try again
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Activation code sent to your email'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-activation-email:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})