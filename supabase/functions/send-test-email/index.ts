import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TestEmailRequest {
  email: string;
  from_name?: string;
  from_email?: string;
  reply_to?: string;
  test_type?: string;
  to?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🚀 Send Test Email function started');

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
    const { data: userData, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !userData.user) {
      console.error('❌ Invalid token:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const user = userData.user;

    // Verify user has @easeworks.com email
    if (!user.email?.endsWith('@easeworks.com')) {
      console.error('❌ Unauthorized domain:', user.email);
      return new Response(
        JSON.stringify({ error: 'Only @easeworks.com email addresses are allowed' }),
        { status: 403, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('✅ User authenticated:', user.email);

    // Parse request body
    const { email, to, from_name, from_email, reply_to, test_type }: TestEmailRequest = await req.json();
    const targetEmail = to || email;

    if (!targetEmail) {
      return new Response(
        JSON.stringify({ error: 'Target email address is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('📧 Sending test email to:', targetEmail);

    // Get user's Microsoft 365 connection
    const { data: connection, error: connectionError } = await supabase
      .from('crm_email_connections')
      .select('*')
      .eq('user_id', user.id)
      .eq('connection_status', 'connected')
      .maybeSingle();

    if (connectionError) {
      console.error('❌ Database error:', connectionError);
      return new Response(
        JSON.stringify({ error: 'Failed to check email connection' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (!connection) {
      console.error('❌ No Microsoft 365 connection found');
      return new Response(
        JSON.stringify({ error: 'Microsoft 365 connection required. Please connect your Microsoft 365 account first.' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Check if token needs refresh
    let accessToken = connection.access_token_encrypted;
    if (new Date(connection.token_expires_at) <= new Date()) {
      console.log('🔄 Refreshing expired token');
      accessToken = await refreshAccessToken(connection.refresh_token_encrypted, connection.id, supabase);
    }

    // Prepare email content
    const emailSubject = test_type === 'custom' 
      ? `Test Email from ${from_name || user.email}` 
      : '🧪 Test Email from EaseLearn';
    
    const emailBody = test_type === 'custom'
      ? `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
           <h2>Test Email</h2>
           <p>This is a test email sent from the EaseLearn CRM system.</p>
           <p><strong>Sent by:</strong> ${from_name || user.email}</p>
           <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
         </div>`
      : `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
           <h1 style="color: #655DC6;">✅ Email System Working!</h1>
           <p>This is a test email to confirm that the EaseLearn email system is functioning properly.</p>
           <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
             <h3 style="margin: 0 0 10px 0; color: #475569;">System Status:</h3>
             <ul style="margin: 0; color: #64748b;">
               <li>✅ Microsoft 365 connection successful</li>
               <li>✅ Email delivery working</li>
               <li>✅ Templates rendering correctly</li>
             </ul>
           </div>
           <p style="color: #64748b; font-size: 14px;">
             Sent at: ${new Date().toLocaleString()}
           </p>
         </div>`;

    // Send email using Microsoft Graph API
    const emailPayload = {
      message: {
        subject: emailSubject,
        body: {
          contentType: 'HTML',
          content: emailBody
        },
        toRecipients: [
          {
            emailAddress: {
              address: targetEmail
            }
          }
        ],
        from: {
          emailAddress: {
            address: from_email || connection.email_address,
            name: from_name || user.email
          }
        }
      }
    };

    if (reply_to) {
      emailPayload.message.replyTo = [
        {
          emailAddress: {
            address: reply_to
          }
        }
      ];
    }

    const sendResponse = await fetch('https://graph.microsoft.com/v1.0/me/sendMail', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    if (!sendResponse.ok) {
      const errorText = await sendResponse.text();
      console.error('❌ Failed to send email:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to send test email' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    console.log('✅ Test email sent successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: `Test email sent successfully to ${targetEmail}`
      }),
      { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error: any) {
    console.error('💥 Error in send-test-email function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

// Function to refresh Microsoft access token
async function refreshAccessToken(refreshToken: string, connectionId: string, supabase: any): Promise<string> {
  const clientId = Deno.env.get('MICROSOFT_CLIENT_ID');
  const clientSecret = Deno.env.get('MICROSOFT_CLIENT_SECRET');
  const tenantId = Deno.env.get('MICROSOFT_TENANT_ID');
  
  const tokenResponse = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error('Failed to refresh access token');
  }

  const tokens = await tokenResponse.json();
  
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