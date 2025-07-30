import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OAuthConnectRequest {
  action: 'initiate' | 'callback';
  code?: string;
  state?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 Microsoft OAuth Connect function started');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body once
    const requestBody = await req.json();
    const { action, code, state } = requestBody;
    
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    
    // For callback action, we need to be more permissive during OAuth flow
    if (!authHeader && action !== 'callback') {
      console.error('❌ No authorization header for action:', action);
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    let user = null;
    let userDomainValidated = false;

    if (authHeader) {
      // Verify the user token
      const token = authHeader.replace('Bearer ', '');
      const { data: userData, error: authError } = await supabase.auth.getUser(token);
      
      if (authError || !userData.user) {
        console.error('❌ Invalid token:', authError);
        return new Response(
          JSON.stringify({ error: 'Invalid token' }),
          { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      user = userData.user;

      // Verify user has @easeworks.com email
      if (!user.email?.endsWith('@easeworks.com')) {
        console.error('❌ Unauthorized domain:', user.email);
        return new Response(
          JSON.stringify({ error: 'Only @easeworks.com email addresses are allowed' }),
          { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      userDomainValidated = true;
      console.log('✅ User authenticated:', user.email);
    }

    console.log('📝 OAuth action:', action);

    // Get Microsoft OAuth credentials from integrations instead of environment variables
    const { data: msIntegrations, error: integrationError } = await supabase
      .from('integrations')
      .select('credentials, integration_providers!inner(name, config_schema)')
      .or('integration_providers.name.eq.microsoft_teams,integration_providers.name.eq.onedrive,integration_providers.name.eq.outlook_calendar')
      .eq('status', 'active')
      .limit(1);

    if (integrationError || !msIntegrations || msIntegrations.length === 0) {
      console.error('❌ No active Microsoft integration found:', integrationError);
      return new Response(
        JSON.stringify({ 
          error: 'Microsoft OAuth not configured',
          details: 'No active Microsoft integration found in your integration hub'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const msIntegration = msIntegrations[0];
    const clientId = msIntegration.credentials?.client_id;
    const clientSecret = msIntegration.credentials?.client_secret;
    const tenantId = msIntegration.credentials?.tenant_id || 'common'; // Use 'common' if not specified
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/microsoft-oauth-connect`;

    console.log('🔧 Integration credentials check:', {
      clientId: clientId ? 'Set' : 'Missing',
      clientSecret: clientSecret ? 'Set' : 'Missing', 
      tenantId: tenantId ? tenantId : 'Using common',
      redirectUri: redirectUri
    });

    if (!clientId || !clientSecret) {
      console.error('❌ Missing Microsoft OAuth credentials in integration');
      return new Response(
        JSON.stringify({ 
          error: 'Microsoft OAuth not configured',
          details: 'Please configure client_id and client_secret in your Microsoft integration'
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (action === 'initiate') {
      if (!user || !userDomainValidated) {
        return new Response(
          JSON.stringify({ error: 'Authentication required for initiate action' }),
          { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      // Generate OAuth URL for Microsoft 365
      const scope = 'openid profile email Mail.Send Mail.ReadWrite MailboxSettings.Read User.Read offline_access';
      const authUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?` +
        `client_id=${clientId}&` +
        `response_type=code&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=${encodeURIComponent(scope)}&` +
        `state=${user.id}&` +
        `response_mode=query`;

      console.log('✅ Generated OAuth URL');
      return new Response(
        JSON.stringify({ authUrl }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (action === 'callback') {
      
      if (!code || !state) {
        console.error('❌ Missing code or state for callback');
        return new Response(
          JSON.stringify({ error: 'Missing required callback parameters' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      console.log('🔄 Processing callback - code:', code?.substring(0, 10) + '...', 'state:', state);
      
      // Exchange code for tokens
      console.log('🔄 Exchanging code for tokens');
      
      const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
          scope: 'openid profile email Mail.Send Mail.ReadWrite MailboxSettings.Read User.Read offline_access',
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('❌ Token exchange failed:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to exchange code for tokens' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      const tokens = await tokenResponse.json();
      console.log('✅ Successfully obtained tokens');

      // Get user info from Microsoft Graph
      const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      });

      if (!userInfoResponse.ok) {
        console.error('❌ Failed to get user info from Microsoft Graph');
        return new Response(
          JSON.stringify({ error: 'Failed to get user information' }),
          { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      const userInfo = await userInfoResponse.json();
      console.log('📧 Microsoft user email:', userInfo.mail || userInfo.userPrincipalName);

      // Store connection in database
      const { error: dbError } = await supabase
        .from('crm_email_connections')
        .upsert({
          user_id: state, // This is the user ID from state parameter
          email_address: userInfo.mail || userInfo.userPrincipalName,
          connection_status: 'connected',
          access_token_encrypted: tokens.access_token, // In production, encrypt this
          refresh_token_encrypted: tokens.refresh_token, // In production, encrypt this
          token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
          last_sync_at: new Date().toISOString(),
        });

      if (dbError) {
        console.error('❌ Database error:', dbError);
        return new Response(
          JSON.stringify({ error: 'Failed to save connection' }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }

      console.log('✅ Connection saved successfully');
      return new Response(
        JSON.stringify({ 
          success: true, 
          email: userInfo.mail || userInfo.userPrincipalName 
        }),
        { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('💥 Error in microsoft-oauth-connect function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);