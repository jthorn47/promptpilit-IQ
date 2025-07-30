
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
    // Simulate background job failures
    const failures = [
      {
        id: '1',
        job_name: 'Payroll Processing',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        error: 'Database connection timeout',
        status: 'failed'
      },
      {
        id: '2',
        job_name: 'Email Notification Batch',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        error: 'SMTP server unavailable',
        status: 'failed'
      },
      {
        id: '3',
        job_name: 'Report Generation',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        error: 'Memory limit exceeded',
        status: 'timeout'
      }
    ]

    return new Response(
      JSON.stringify({ failures }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Job service error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
