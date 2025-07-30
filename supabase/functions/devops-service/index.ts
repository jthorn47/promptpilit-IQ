
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Simulate scheduled deployments/maintenance
    const events = [
      {
        id: '1',
        name: 'Production Deploy v2.1.3',
        type: 'deployment',
        environment: 'production',
        scheduled_date: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        status: 'scheduled'
      },
      {
        id: '2',
        name: 'Database Migration - Client Schema',
        type: 'maintenance',
        environment: 'production',
        scheduled_date: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
        status: 'scheduled'
      },
      {
        id: '3',
        name: 'Security Patch Rollout',
        type: 'deployment',
        environment: 'all',
        scheduled_date: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
        status: 'approved'
      }
    ]

    return new Response(
      JSON.stringify({ events }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('DevOps service error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
