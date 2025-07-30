import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Get the authenticated user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check user's email connections
    const { data: connections, error: fetchError } = await supabaseClient
      .from('crm_email_connections')
      .select('*')
      .eq('user_id', user.id);

    if (fetchError) {
      console.error('Error fetching connections:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch connections' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!connections || connections.length === 0) {
      return new Response(
        JSON.stringify({ 
          hasConnections: false,
          needsRefresh: false,
          message: 'No email connections found'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const now = new Date();
    const thirtyMinutesFromNow = new Date(now.getTime() + 30 * 60 * 1000);

    let needsRefresh = false;
    let expiredConnections = [];
    let soonToExpireConnections = [];

    for (const connection of connections) {
      const expiryDate = new Date(connection.token_expires_at);
      
      if (expiryDate <= now) {
        expiredConnections.push({
          id: connection.id,
          email: connection.email_address,
          status: 'expired'
        });
        needsRefresh = true;
      } else if (expiryDate <= thirtyMinutesFromNow) {
        soonToExpireConnections.push({
          id: connection.id,
          email: connection.email_address,
          expiresAt: connection.token_expires_at,
          status: 'expiring_soon'
        });
        needsRefresh = true;
      }
    }

    // Auto-refresh tokens if they're expired or expiring soon
    if (needsRefresh) {
      console.log(`Auto-refreshing tokens for user ${user.id}`);
      
      try {
        const refreshResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/refresh-microsoft-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({ userId: user.id }),
        });

        if (refreshResponse.ok) {
          const refreshResult = await refreshResponse.json();
          console.log('Auto-refresh completed:', refreshResult);
        }
      } catch (refreshError) {
        console.error('Auto-refresh failed:', refreshError);
      }
    }

    return new Response(
      JSON.stringify({
        hasConnections: true,
        needsRefresh,
        expiredConnections,
        soonToExpireConnections,
        totalConnections: connections.length,
        message: needsRefresh ? 'Token refresh initiated' : 'All tokens are valid'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in check-token-expiry function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});