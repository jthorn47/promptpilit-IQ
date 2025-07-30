
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Simulate system notifications
    const notifications = [
      {
        id: '1',
        type: 'system',
        title: 'Database maintenance scheduled',
        message: 'Scheduled maintenance window: Tonight 2:00 AM - 4:00 AM PST',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        priority: 'high'
      },
      {
        id: '2',
        type: 'security',
        title: 'Security patch applied',
        message: 'Critical security update deployed successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        priority: 'medium'
      },
      {
        id: '3',
        type: 'performance',
        title: 'System performance alert',
        message: 'API response times elevated for the past 15 minutes',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        priority: 'medium'
      }
    ]

    return new Response(
      JSON.stringify({ notifications }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Notification service error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
