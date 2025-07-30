import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendEmailRequest {
  to: Array<{ email: string; name?: string }>;
  cc?: Array<{ email: string; name?: string }>;
  bcc?: Array<{ email: string; name?: string }>;
  subject: string;
  body: string;
  isHtml?: boolean;
  enableTracking?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('📧 Microsoft Send Email function started');

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

    const emailData: SendEmailRequest = await req.json();
    console.log('📤 Sending email to:', emailData.to.map(r => r.email).join(', '));

    // Check if token needs refresh
    let accessToken = connection.access_token_encrypted;
    if (new Date(connection.token_expires_at) <= new Date()) {
      console.log('🔄 Refreshing access token');
      accessToken = await refreshAccessToken(connection.refresh_token_encrypted, connection.id, supabase);
    }

    // Add tracking pixel if enabled
    let finalBody = emailData.body;
    let trackingId = null;
    
    if (emailData.enableTracking) {
      trackingId = crypto.randomUUID();
      const trackingPixel = `<img src="${Deno.env.get('SUPABASE_URL')}/functions/v1/email-tracking?id=${trackingId}" width="1" height="1" style="display:none;" />`;
      
      if (emailData.isHtml) {
        finalBody += trackingPixel;
      }

      // Store tracking record
      await supabase
        .from('crm_email_tracking')
        .insert({
          tracking_id: trackingId,
          message_id: trackingId, // Will update with actual message ID after sending
          sender_id: user.id,
          recipient_email: emailData.to[0].email,
          status: 'sent',
        });
    }

    // Prepare Microsoft Graph email payload
    const graphPayload = {
      message: {
        subject: emailData.subject,
        body: {
          contentType: emailData.isHtml ? 'HTML' : 'Text',
          content: finalBody,
        },
        toRecipients: emailData.to.map(recipient => ({
          emailAddress: {
            address: recipient.email,
            name: recipient.name || recipient.email,
          },
        })),
        ccRecipients: emailData.cc?.map(recipient => ({
          emailAddress: {
            address: recipient.email,
            name: recipient.name || recipient.email,
          },
        })) || [],
        bccRecipients: emailData.bcc?.map(recipient => ({
          emailAddress: {
            address: recipient.email,
            name: recipient.name || recipient.email,
          },
        })) || [],
      },
      saveToSentItems: true,
    };

    // Send email via Microsoft Graph
    const sendResponse = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(graphPayload),
    });

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      console.error('❌ Failed to send email:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('✅ Email sent successfully');

    // Store message record
    const { error: messageError } = await supabase
      .from('crm_email_messages')
      .insert({
        user_id: user.id,
        message_id: trackingId || crypto.randomUUID(),
        subject: emailData.subject,
        sender_email: connection.email_address,
        recipients: emailData.to,
        cc_recipients: emailData.cc || [],
        bcc_recipients: emailData.bcc || [],
        body_content: finalBody,
        is_html: emailData.isHtml || false,
        is_sent: true,
        message_type: 'sent',
        tracking_enabled: emailData.enableTracking || false,
        sent_at: new Date().toISOString(),
      });

    if (messageError) {
      console.error('⚠️ Failed to store message record:', messageError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        messageId: trackingId,
        trackingEnabled: emailData.enableTracking || false 
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error) {
    console.error('💥 Error in microsoft-send-email function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

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