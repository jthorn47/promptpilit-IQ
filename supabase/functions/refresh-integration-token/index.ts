import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RefreshTokenRequest {
  app: string;
  clientId: string;
}

interface OAuthRefreshResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { app, clientId }: RefreshTokenRequest = await req.json();

    if (!app || !clientId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: app, clientId' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Get current token data
    const { data: tokenData, error: tokenError } = await supabase
      .from('integration_tokens')
      .select('*')
      .eq('app_name', app)
      .eq('client_id', clientId)
      .single();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ 
          error: `Integration '${app}' not found for client`,
          code: 'INTEGRATION_NOT_FOUND'
        }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    if (!tokenData.refresh_token) {
      return new Response(
        JSON.stringify({ 
          error: 'No refresh token available for this integration',
          code: 'NO_REFRESH_TOKEN'
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Get OAuth configuration for the app
    const { data: oauthConfig, error: configError } = await supabase
      .from('oauth_configurations')
      .select('*')
      .eq('app_name', app)
      .single();

    if (configError || !oauthConfig) {
      return new Response(
        JSON.stringify({ 
          error: `OAuth configuration not found for ${app}`,
          code: 'CONFIG_NOT_FOUND'
        }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Prepare refresh token request
    const refreshBody = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: tokenData.refresh_token,
      client_id: oauthConfig.client_id,
      client_secret: oauthConfig.client_secret
    });

    console.log(`Refreshing token for ${app} client ${clientId}`);

    // Make refresh token request to OAuth provider
    const refreshResponse = await fetch(oauthConfig.token_url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: refreshBody.toString()
    });

    if (!refreshResponse.ok) {
      const errorText = await refreshResponse.text();
      console.error(`Token refresh failed for ${app}:`, errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to refresh token with OAuth provider',
          code: 'REFRESH_FAILED',
          details: errorText
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const refreshData: OAuthRefreshResponse = await refreshResponse.json();

    // Calculate new expiration time
    const expiresAt = refreshData.expires_in 
      ? new Date(Date.now() + refreshData.expires_in * 1000).toISOString()
      : null;

    // Update token in database
    const { error: updateError } = await supabase
      .from('integration_tokens')
      .update({
        access_token: refreshData.access_token,
        refresh_token: refreshData.refresh_token || tokenData.refresh_token, // Keep old refresh token if new one not provided
        expires_at: expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('app_name', app)
      .eq('client_id', clientId);

    if (updateError) {
      console.error('Failed to update token in database:', updateError);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to update token in database',
          code: 'DATABASE_UPDATE_FAILED'
        }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Log the refresh activity
    await supabase
      .from('integration_audit_log')
      .insert({
        app_name: app,
        client_id: clientId,
        action: 'token_refreshed',
        requested_by: 'system',
        purpose: 'automatic_refresh',
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'system'
      });

    console.log(`Token successfully refreshed for ${app} client ${clientId}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        expiresAt: expiresAt,
        app: app,
        refreshedAt: new Date().toISOString()
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in refresh-integration-token:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);