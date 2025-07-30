import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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

    // Get the user from the auth header
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }

    if (req.method === 'POST') {
      const { modules } = await req.json()

      // Validate the request
      if (!modules || !Array.isArray(modules)) {
        return new Response(
          JSON.stringify({ error: 'Invalid modules array' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      // Store the user's HaaLO IQ module order preferences
      const { error } = await supabaseClient
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          preference_key: 'haalo_iq_module_order',
          preference_value: JSON.stringify({ modules }),
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving HaaLO IQ module order:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to save module order' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }

      return new Response(
        JSON.stringify({ success: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    if (req.method === 'GET') {
      // Get the user's HaaLO IQ module order preferences
      const { data, error } = await supabaseClient
        .from('user_preferences')
        .select('preference_value')
        .eq('user_id', user.id)
        .eq('preference_key', 'haalo_iq_module_order')
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error getting HaaLO IQ module order:', error)
        return new Response(
          JSON.stringify({ error: 'Failed to get module order' }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }

      const modules = data?.preference_value ? JSON.parse(data.preference_value).modules : [];
      return new Response(
        JSON.stringify({ modules }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405 
      }
    )

  } catch (error) {
    console.error('Error in haalo-iq-order function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})