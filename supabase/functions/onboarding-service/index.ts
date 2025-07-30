
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: clients, error } = await supabase
      .from('clients')
      .select('company_name, onboarding_status, account_manager')
      .in('onboarding_status', ['pending', 'in_progress'])

    if (error) throw error

    const progress = clients?.map(client => ({
      company_name: client.company_name,
      progress: client.onboarding_status === 'pending' ? 10 : 65,
      status: client.onboarding_status,
      account_manager: client.account_manager || 'Unassigned'
    })) || []

    return new Response(
      JSON.stringify({ progress }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Onboarding service error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
