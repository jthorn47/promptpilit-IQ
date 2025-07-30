
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

    const url = new URL(req.url)
    const endpoint = url.pathname.split('/').pop()

    switch (endpoint) {
      case 'active-count':
        const { data: activeClients, error: activeError } = await supabase
          .from('clients')
          .select('id')
          .eq('status', 'active')

        if (activeError) throw activeError

        return new Response(
          JSON.stringify({ count: activeClients?.length || 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'new-monthly-count':
        const currentMonth = new Date()
        const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
        
        const { data: newClients, error: newError } = await supabase
          .from('clients')
          .select('id')
          .gte('created_at', firstDay.toISOString())

        if (newError) throw newError

        return new Response(
          JSON.stringify({ count: newClients?.length || 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid endpoint' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Client service error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
