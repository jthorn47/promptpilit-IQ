import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RefreshTokenRequest {
  userId?: string;
  connectionId?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { userId, connectionId }: RefreshTokenRequest = await req.json();

    // Get the connection that needs refreshing
    let query = supabaseClient
      .from('crm_email_connections')
      .select('*');

    if (connectionId) {
      query = query.eq('id', connectionId);
    } else if (userId) {
      query = query.eq('user_id', userId);
    } else {
      // Get all connections that need refreshing (token expires within 1 hour)
      const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      query = query.lt('token_expires_at', oneHourFromNow);
    }

    const { data: connections, error: fetchError } = await query;

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
        JSON.stringify({ message: 'No connections found or none need refreshing' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const refreshedConnections = [];

    for (const connection of connections) {
      try {
        console.log(`Refreshing token for connection ${connection.id}`);

        // Get Microsoft OAuth credentials from integrations
        const { data: msIntegrations, error: integrationError } = await supabaseClient
          .from('integrations')
          .select('credentials, integration_providers!inner(name)')
          .or('integration_providers.name.eq.microsoft_teams,integration_providers.name.eq.onedrive,integration_providers.name.eq.outlook_calendar')
          .eq('status', 'active')
          .limit(1);

        if (integrationError || !msIntegrations || msIntegrations.length === 0) {
          console.error('No active Microsoft integration found:', integrationError);
          continue;
        }

        const msIntegration = msIntegrations[0];
        const clientId = msIntegration.credentials?.client_id;
        const clientSecret = msIntegration.credentials?.client_secret;

        if (!clientId || !clientSecret) {
          console.error('Microsoft integration missing client_id or client_secret');
          continue;
        }

        // Use the refresh token to get a new access token
        const refreshResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: connection.refresh_token_encrypted,
            grant_type: 'refresh_token',
            scope: 'https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/Mail.Send https://graph.microsoft.com/User.Read openid profile email',
          }),
        });

        if (!refreshResponse.ok) {
          const errorText = await refreshResponse.text();
          console.error(`Failed to refresh token for connection ${connection.id}:`, errorText);
          
          // If refresh token is invalid, mark connection as expired
          if (refreshResponse.status === 400) {
            await supabaseClient
              .from('crm_email_connections')
              .update({
                connection_status: 'expired',
                updated_at: new Date().toISOString(),
              })
              .eq('id', connection.id);
          }
          
          continue;
        }

        const tokenData = await refreshResponse.json();

        // Calculate new expiry time (tokens typically last 1 hour)
        const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000));

        // Update the connection with new tokens
        const { error: updateError } = await supabaseClient
          .from('crm_email_connections')
          .update({
            access_token_encrypted: tokenData.access_token,
            refresh_token_encrypted: tokenData.refresh_token || connection.refresh_token_encrypted,
            token_expires_at: expiresAt.toISOString(),
            connection_status: 'connected',
            last_sync_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', connection.id);

        if (updateError) {
          console.error(`Error updating connection ${connection.id}:`, updateError);
          continue;
        }

        refreshedConnections.push({
          connectionId: connection.id,
          emailAddress: connection.email_address,
          expiresAt: expiresAt.toISOString(),
        });

        console.log(`Successfully refreshed token for ${connection.email_address}`);

      } catch (error) {
        console.error(`Error refreshing connection ${connection.id}:`, error);
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Token refresh completed',
        refreshedConnections,
        totalProcessed: connections.length,
        successfulRefreshes: refreshedConnections.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in refresh-microsoft-token function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});