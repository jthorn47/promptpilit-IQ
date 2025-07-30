import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  console.log('🔄 Microsoft Sync Emails function started');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(
        JSON.stringify({ error: 'Authorization required' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Verify the user token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.error('❌ Invalid token:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get user's email connection
    const { data: connection, error: connectionError } = await supabase
      .from('crm_email_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('connection_status', 'connected')
      .single();

    if (connectionError || !connection) {
      console.error('❌ No valid email connection found:', connectionError);
      return new Response(
        JSON.stringify({ error: 'Microsoft 365 not connected' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if token needs refresh
    let accessToken = connection.access_token_encrypted;
    if (new Date(connection.token_expires_at) <= new Date()) {
      console.log('🔄 Refreshing access token');
      accessToken = await refreshAccessToken(connection.refresh_token_encrypted, connection.id, supabase);
    }

    // Sync inbox messages
    console.log('📥 Syncing inbox messages');
    const inboxMessages = await fetchMessages(accessToken, 'inbox');
    await storeMessages(inboxMessages, user.id, 'received', supabase);

    // Sync sent messages
    console.log('📤 Syncing sent messages');
    const sentMessages = await fetchMessages(accessToken, 'sentitems');
    await storeMessages(sentMessages, user.id, 'sent', supabase);

    // Update last sync time
    await supabase
      .from('crm_email_connections')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', connection.id);

    console.log('✅ Email sync completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        inboxCount: inboxMessages.length,
        sentCount: sentMessages.length 
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('💥 Error in microsoft-sync-emails function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

async function fetchMessages(accessToken: string, folder: string): Promise<any[]> {
  const response = await fetch(`https://graph.microsoft.com/v1.0/me/mailFolders/${folder}/messages?$top=50&$orderby=receivedDateTime desc`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Failed to fetch messages:', errorText);
    return [];
  }

  const data = await response.json();
  return data.value || [];
}

async function storeMessages(messages: any[], userId: string, messageType: string, supabase: any) {
  for (const message of messages) {
    // Check if message already exists
    const { data: existingMessage } = await supabase
      .from('crm_email_messages')
      .select('id')
      .eq('message_id', message.id)
      .single();

    if (existingMessage) {
      continue; // Skip if already exists
    }

    // Parse recipients
    const recipients = message.toRecipients?.map((r: any) => ({
      email: r.emailAddress.address,
      name: r.emailAddress.name,
    })) || [];

    const ccRecipients = message.ccRecipients?.map((r: any) => ({
      email: r.emailAddress.address,
      name: r.emailAddress.name,
    })) || [];

    const bccRecipients = message.bccRecipients?.map((r: any) => ({
      email: r.emailAddress.address,
      name: r.emailAddress.name,
    })) || [];

    // Store message
    const { error } = await supabase
      .from('crm_email_messages')
      .insert({
        user_id: userId,
        message_id: message.id,
        thread_id: message.conversationId,
        subject: message.subject,
        sender_email: message.sender?.emailAddress?.address,
        sender_name: message.sender?.emailAddress?.name,
        recipients: recipients,
        cc_recipients: ccRecipients,
        bcc_recipients: bccRecipients,
        body_preview: message.bodyPreview,
        body_content: message.body?.content,
        is_html: message.body?.contentType === 'html',
        is_read: message.isRead,
        is_sent: messageType === 'sent',
        has_attachments: message.hasAttachments || false,
        message_type: messageType,
        tracking_enabled: false,
        sent_at: messageType === 'sent' ? message.sentDateTime : null,
        received_at: messageType === 'received' ? message.receivedDateTime : null,
      });

    if (error) {
      console.error('⚠️ Failed to store message:', error);
    }
  }
}

async function refreshAccessToken(refreshToken: string, connectionId: string, supabase: any): Promise<string> {
  const clientId = Deno.env.get('MICROSOFT_CLIENT_ID');
  const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET');
  const tenantId = Deno.env.get('MICROSOFT_TENANT_ID');

  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
      scope: 'Mail.Send Mail.ReadWrite MailboxSettings.Read User.Read offline_access',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const tokens = await response.json();

  // Update tokens in database
  await supabase
    .from('crm_email_connections')
    .update({
      access_token_encrypted: tokens.access_token,
      refresh_token_encrypted: tokens.refresh_token,
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    })
    .eq('id', connectionId);

  return tokens.access_token;
}

serve(handler);