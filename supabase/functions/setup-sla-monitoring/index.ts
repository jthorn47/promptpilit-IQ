import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    console.log('Setting up SLA monitoring cron jobs...');

    // Create cron job to run SLA processor every hour
    const cronQuery = `
      SELECT cron.schedule(
        'sla-monitoring-hourly',
        '0 * * * *', -- Every hour
        $$
        SELECT
          net.http_post(
              url:='https://xfamotequcavggiqndfj.supabase.co/functions/v1/sla-processor',
              headers:='{"Content-Type": "application/json", "Authorization": "Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}"}'::jsonb,
              body:=concat('{"time": "', now(), '"}')::jsonb
          ) as request_id;
        $$
      );
    `;

    const { error: cronError } = await supabaseClient.rpc('execute_sql', { 
      query: cronQuery 
    });

    if (cronError) {
      console.error('Error setting up cron job:', cronError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to set up cron job', 
          details: cronError.message,
          manual_setup_required: true,
          instructions: 'Please manually set up the cron job in Supabase SQL editor'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('SLA monitoring cron job set up successfully');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'SLA monitoring system initialized successfully',
        cron_schedule: 'Every hour (0 * * * *)',
        next_run: 'Within the next hour'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in SLA setup:', error);
    return new Response(
      JSON.stringify({ 
        error: 'SLA setup failed', 
        details: error.message,
        fallback: 'Manual cron setup required in Supabase dashboard'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});