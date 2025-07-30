
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
      case 'uptime':
        // Simulate 30-day uptime calculation
        const uptime = 99.8 + (Math.random() * 0.4 - 0.2) // 99.6-100%
        return new Response(
          JSON.stringify({ 
            uptime: parseFloat(uptime.toFixed(2)),
            trend: uptime > 99.5 ? 'up' : 'down',
            period: '30d'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      case 'system-metrics':
        // Simulate system health metrics
        const metrics = {
          api_latency: {
            value: Math.floor(Math.random() * 100) + 20, // 20-120ms
            status: 'healthy',
            unit: 'ms'
          },
          db_health: {
            value: 99.9,
            status: 'healthy',
            unit: '%'
          },
          error_rate: {
            value: parseFloat((Math.random() * 0.5).toFixed(2)), // 0-0.5%
            status: Math.random() > 0.8 ? 'warning' : 'healthy',
            unit: '%'
          },
          queue_size: {
            value: Math.floor(Math.random() * 50),
            status: Math.random() > 0.9 ? 'warning' : 'healthy',
            unit: 'jobs'
          }
        }

        return new Response(
          JSON.stringify({ metrics }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid endpoint' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
  } catch (error) {
    console.error('Monitoring service error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
