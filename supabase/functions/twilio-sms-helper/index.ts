import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

interface TwilioCredentials {
  account_sid: string;
  auth_token: string;
  messaging_service_sid?: string;
  phone_number?: string;
}

interface SendSMSRequest {
  to: string;
  message: string;
  client_id?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { to, message, client_id }: SendSMSRequest = await req.json();

    console.log('📱 Sending SMS:', { to, message: message.substring(0, 50) + '...', client_id });

    // Get Twilio credentials from the integrations table
    const { data: credentialsData, error: credentialsError } = await supabase
      .rpc('get_twilio_credentials', { p_client_id: client_id });

    if (credentialsError || !credentialsData?.length) {
      console.error('❌ No Twilio credentials found:', credentialsError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Twilio API key is not connected. Please update it in Integration Hub.'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    const credentials = credentialsData[0] as TwilioCredentials;
    
    if (!credentials.account_sid || !credentials.auth_token) {
      console.error('❌ Invalid Twilio credentials');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid Twilio credentials. Please check your Integration Hub settings.'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Prepare Twilio API request
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${credentials.account_sid}/Messages.json`;
    const auth = btoa(`${credentials.account_sid}:${credentials.auth_token}`);

    // Determine the "from" parameter
    let fromParam: string;
    if (credentials.messaging_service_sid) {
      fromParam = credentials.messaging_service_sid;
    } else if (credentials.phone_number) {
      fromParam = credentials.phone_number;
    } else {
      console.error('❌ No messaging service SID or phone number configured');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No Twilio phone number or messaging service configured. Please update your Integration Hub settings.'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    // Prepare the request body
    const body = new URLSearchParams({
      To: to,
      Body: message,
      ...(credentials.messaging_service_sid 
        ? { MessagingServiceSid: credentials.messaging_service_sid }
        : { From: credentials.phone_number! }
      )
    });

    console.log('🔄 Sending to Twilio API...');

    // Send SMS via Twilio API
    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('❌ Twilio API error:', twilioResult);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Twilio API Error: ${twilioResult.message || 'Unknown error'}`,
          details: twilioResult
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: twilioResponse.status 
        }
      );
    }

    console.log('✅ SMS sent successfully:', twilioResult.sid);

    return new Response(
      JSON.stringify({
        success: true,
        message_sid: twilioResult.sid,
        status: twilioResult.status,
        to: twilioResult.to,
        from: twilioResult.from
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ SMS helper error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});