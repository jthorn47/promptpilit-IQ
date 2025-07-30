import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UseCredentialsRequest {
  sessionToken: string;
  purpose: string;
}

interface IntegrationCredentials {
  access_token: string;
  refresh_token?: string;
  expires_at?: string;
  connection_id?: string;
  app_name: string;
  client_id: string;
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

    const { sessionToken, purpose }: UseCredentialsRequest = await req.json();

    if (!sessionToken || !purpose) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: sessionToken, purpose' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Fetch and validate session token
    const { data: sessionData, error: sessionError } = await supabase
      .from('integration_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .single();

    if (sessionError || !sessionData) {
      console.error('Invalid session token:', sessionToken);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid or expired session token',
          code: 'INVALID_SESSION'
        }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Check if session is expired
    const now = new Date();
    const expiresAt = new Date(sessionData.expires_at);
    if (expiresAt <= now) {
      // Clean up expired session
      await supabase
        .from('integration_sessions')
        .delete()
        .eq('session_token', sessionToken);

      return new Response(
        JSON.stringify({ 
          error: 'Session token has expired',
          code: 'SESSION_EXPIRED'
        }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Log credential usage
    await supabase
      .from('integration_audit_log')
      .insert({
        app_name: sessionData.app_name,
        client_id: sessionData.client_id,
        action: 'credentials_used',
        requested_by: sessionData.requested_by,
        purpose: purpose,
        session_token: sessionToken,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      });

    // Return the credentials
    const credentials: IntegrationCredentials = {
      access_token: sessionData.access_token,
      refresh_token: sessionData.refresh_token,
      expires_at: sessionData.expires_at,
      connection_id: sessionData.connection_id,
      app_name: sessionData.app_name,
      client_id: sessionData.client_id
    };

    console.log(`Credentials provided for ${sessionData.app_name} client ${sessionData.client_id} (${purpose})`);

    return new Response(
      JSON.stringify({ 
        success: true,
        credentials: credentials,
        sessionExpiresAt: sessionData.expires_at
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in use-integration-credentials:', error);
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