import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token, action = 'submit' } = await req.json()

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: 'No reCAPTCHA token provided' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Get the reCAPTCHA secret key from Supabase secrets
    const recaptchaSecret = Deno.env.get('RECAPTCHA_SECRET_KEY')
    
    if (!recaptchaSecret) {
      console.error('RECAPTCHA_SECRET_KEY not configured')
      return new Response(
        JSON.stringify({ success: false, error: 'reCAPTCHA not properly configured' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      )
    }

    // Verify the reCAPTCHA token with Google
    const verificationResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret: recaptchaSecret,
        response: token,
      }),
    })

    const verificationResult = await verificationResponse.json()

    console.log('reCAPTCHA verification result:', verificationResult)

    if (verificationResult.success) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          score: verificationResult.score,
          action: verificationResult.action 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'reCAPTCHA verification failed',
          errors: verificationResult['error-codes'] 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})