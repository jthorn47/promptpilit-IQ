import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    switch (action) {
      case 'initiate':
        return await handleSSOInitiate(req, supabase);
      case 'callback':
        return await handleSSOCallback(req, supabase);
      case 'metadata':
        return await handleSAMLMetadata(req, supabase);
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    console.error('Error in SAML auth function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleSSOInitiate(req: Request, supabase: any) {
  const { companyId, email } = await req.json();

  // Get SSO configuration for the company
  const { data: ssoConfig, error: configError } = await supabase
    .from('sso_configurations')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_active', true)
    .single();

  if (configError || !ssoConfig) {
    return new Response(JSON.stringify({ error: 'SSO not configured for this company' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Check domain restrictions
  if (ssoConfig.domain_restrictions && ssoConfig.domain_restrictions.length > 0) {
    const emailDomain = email.split('@')[1];
    if (!ssoConfig.domain_restrictions.includes(emailDomain)) {
      return new Response(JSON.stringify({ error: 'Email domain not allowed for SSO' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  if (ssoConfig.provider_type === 'saml') {
    return await initiateSAMLAuth(ssoConfig, supabase);
  } else if (ssoConfig.provider_type === 'oidc') {
    return await initiateOIDCAuth(ssoConfig, supabase);
  }

  return new Response(JSON.stringify({ error: 'Unsupported provider type' }), {
    status: 400,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function initiateSAMLAuth(ssoConfig: any, supabase: any) {
  const sessionId = crypto.randomUUID();
  const requestId = crypto.randomUUID();
  const relayState = crypto.randomUUID();

  // Store session in database
  await supabase
    .from('sso_sessions')
    .insert({
      session_id: sessionId,
      sso_configuration_id: ssoConfig.id,
      saml_request_id: requestId,
      relay_state: relayState,
      status: 'pending'
    });

  // Generate SAML AuthnRequest
  const issuer = `${Deno.env.get('SUPABASE_URL')}/functions/v1/saml-auth?action=metadata`;
  const acsUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/saml-auth?action=callback`;
  
  const samlRequest = generateSAMLRequest(requestId, issuer, acsUrl, ssoConfig.saml_sso_url);
  const encodedRequest = btoa(samlRequest);

  // Create redirect URL
  const redirectUrl = `${ssoConfig.saml_sso_url}?SAMLRequest=${encodeURIComponent(encodedRequest)}&RelayState=${relayState}`;

  return new Response(JSON.stringify({ 
    redirectUrl,
    sessionId 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function initiateOIDCAuth(ssoConfig: any, supabase: any) {
  const sessionId = crypto.randomUUID();
  const state = crypto.randomUUID();
  const nonce = crypto.randomUUID();

  // Store session in database
  await supabase
    .from('sso_sessions')
    .insert({
      session_id: sessionId,
      sso_configuration_id: ssoConfig.id,
      relay_state: state,
      status: 'pending'
    });

  const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/saml-auth?action=callback`;
  const scope = ssoConfig.oidc_scopes?.join(' ') || 'openid email profile';

  // Parse discovery URL to get authorization endpoint
  const authUrl = `${ssoConfig.oidc_discovery_url.replace('/.well-known/openid_configuration', '')}/oauth2/authorize`;
  
  const params = new URLSearchParams({
    client_id: ssoConfig.oidc_client_id,
    response_type: 'code',
    scope,
    redirect_uri: redirectUri,
    state,
    nonce,
  });

  const redirectUrl = `${authUrl}?${params.toString()}`;

  return new Response(JSON.stringify({ 
    redirectUrl,
    sessionId 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function handleSSOCallback(req: Request, supabase: any) {
  const url = new URL(req.url);
  const relayState = url.searchParams.get('RelayState') || url.searchParams.get('state');
  const samlResponse = url.searchParams.get('SAMLResponse');
  const code = url.searchParams.get('code');

  if (!relayState) {
    return new Response('Missing state parameter', { status: 400 });
  }

  // Get session from database
  const { data: session, error: sessionError } = await supabase
    .from('sso_sessions')
    .select('*, sso_configurations(*)')
    .eq('relay_state', relayState)
    .eq('status', 'pending')
    .single();

  if (sessionError || !session) {
    return new Response('Invalid or expired session', { status: 400 });
  }

  if (samlResponse) {
    return await processSAMLResponse(samlResponse, session, supabase);
  } else if (code) {
    return await processOIDCCallback(code, session, supabase);
  }

  return new Response('Invalid callback', { status: 400 });
}

async function processSAMLResponse(samlResponse: string, session: any, supabase: any) {
  try {
    // Decode and parse SAML response
    const decodedResponse = atob(samlResponse);
    console.log('SAML Response:', decodedResponse);
    
    // In a production implementation, you would:
    // 1. Validate the SAML response signature
    // 2. Parse the XML to extract user attributes
    // 3. Verify the response is for the correct request
    
    // For this example, we'll simulate extracting user info
    const userInfo = {
      email: 'user@company.com', // Would be extracted from SAML response
      firstName: 'John',
      lastName: 'Doe',
      externalUserId: 'saml-user-123'
    };

    return await provisionUser(userInfo, session, supabase);
  } catch (error) {
    console.error('Error processing SAML response:', error);
    return new Response('Failed to process SAML response', { status: 500 });
  }
}

async function processOIDCCallback(code: string, session: any, supabase: any) {
  try {
    const ssoConfig = session.sso_configurations;
    const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/saml-auth?action=callback`;

    // Exchange code for tokens
    const tokenResponse = await fetch(`${ssoConfig.oidc_discovery_url.replace('/.well-known/openid_configuration', '')}/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${ssoConfig.oidc_client_id}:${ssoConfig.oidc_client_secret}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokens = await tokenResponse.json();
    
    if (!tokens.access_token) {
      throw new Error('Failed to get access token');
    }

    // Get user info
    const userResponse = await fetch(`${ssoConfig.oidc_discovery_url.replace('/.well-known/openid_configuration', '')}/oauth2/userinfo`, {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    const userInfo = await userResponse.json();

    return await provisionUser({
      email: userInfo.email,
      firstName: userInfo.given_name || userInfo.name?.split(' ')[0],
      lastName: userInfo.family_name || userInfo.name?.split(' ')[1],
      externalUserId: userInfo.sub
    }, session, supabase);
  } catch (error) {
    console.error('Error processing OIDC callback:', error);
    return new Response('Failed to process OIDC callback', { status: 500 });
  }
}

async function provisionUser(userInfo: any, session: any, supabase: any) {
  const ssoConfig = session.sso_configurations;

  try {
    // Check if user already exists in Supabase Auth
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(userInfo.email);

    let userId: string;

    if (existingUser.user) {
      userId = existingUser.user.id;
    } else if (ssoConfig.auto_provision_users) {
      // Create new user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: userInfo.email,
        email_confirm: true,
        user_metadata: {
          first_name: userInfo.firstName,
          last_name: userInfo.lastName,
          sso_provider: ssoConfig.provider_name
        }
      });

      if (createError) throw createError;
      userId = newUser.user.id;

      // Assign role to new user
      await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: ssoConfig.default_role,
          company_id: ssoConfig.company_id
        });
    } else {
      throw new Error('User does not exist and auto-provisioning is disabled');
    }

    // Update or create SSO user mapping
    await supabase
      .from('sso_user_mappings')
      .upsert({
        user_id: userId,
        sso_configuration_id: ssoConfig.id,
        external_user_id: userInfo.externalUserId,
        external_attributes: userInfo,
        last_login_at: new Date().toISOString()
      });

    // Update session status
    await supabase
      .from('sso_sessions')
      .update({
        status: 'completed',
        user_id: userId
      })
      .eq('id', session.id);

    // Generate Supabase session
    const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userInfo.email,
    });

    if (sessionError) throw sessionError;

    // Redirect to application with session
    const redirectUrl = `${Deno.env.get('SUPABASE_URL').replace('.supabase.co', '.lovable.app')}/?session=${sessionData.properties.action_link}`;
    
    return new Response(null, {
      status: 302,
      headers: {
        ...corsHeaders,
        'Location': redirectUrl
      }
    });
  } catch (error) {
    console.error('Error provisioning user:', error);
    
    // Update session status
    await supabase
      .from('sso_sessions')
      .update({ status: 'failed' })
      .eq('id', session.id);

    return new Response(`SSO Login Failed: ${error.message}`, { status: 500 });
  }
}

async function handleSAMLMetadata(req: Request, supabase: any) {
  const issuer = `${Deno.env.get('SUPABASE_URL')}/functions/v1/saml-auth?action=metadata`;
  const acsUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/saml-auth?action=callback`;

  const metadata = `<?xml version="1.0" encoding="UTF-8"?>
<md:EntityDescriptor xmlns:md="urn:oasis:names:tc:SAML:2.0:metadata" entityID="${issuer}">
  <md:SPSSODescriptor protocolSupportEnumeration="urn:oasis:names:tc:SAML:2.0:protocol">
    <md:AssertionConsumerService 
      Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST" 
      Location="${acsUrl}" 
      index="0" 
      isDefault="true"/>
  </md:SPSSODescriptor>
</md:EntityDescriptor>`;

  return new Response(metadata, {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/xml',
    },
  });
}

function generateSAMLRequest(requestId: string, issuer: string, acsUrl: string, destination: string): string {
  const timestamp = new Date().toISOString();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<samlp:AuthnRequest 
  xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
  xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"
  ID="${requestId}"
  Version="2.0"
  IssueInstant="${timestamp}"
  Destination="${destination}"
  AssertionConsumerServiceURL="${acsUrl}"
  ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST">
  <saml:Issuer>${issuer}</saml:Issuer>
</samlp:AuthnRequest>`;
}