import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { corsHeaders } from '../_shared/cors.ts';

interface SendReplyRequest {
  conversationId: string;
  message: string;
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

    const { conversationId, message }: SendReplyRequest = await req.json();

    console.log('📱 Sending SMS reply:', { conversationId, message: message.substring(0, 50) + '...' });

    // Get conversation details
    const { data: conversation, error: convError } = await supabase
      .from('sms_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      console.error('❌ Conversation not found:', convError);
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Conversation not found'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      );
    }

    // Get Twilio credentials from integrations table  
    const { data: integrationData, error: integrationError } = await supabase
      .from('integrations')
      .select('credentials')
      .in('name', ['twilio', 'HALI - HALO Assisted Live Intelligence'])
      .eq('status', 'active')
      .not('credentials->account_sid', 'is', null)
      .limit(1)
      .single();

    if (integrationError || !integrationData) {
      console.error('❌ No Twilio integration found:', integrationError);
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

    const credentials = integrationData.credentials as {
      account_sid: string;
      auth_token: string;
      messaging_service_sid?: string;
      phone_number?: string;
    };
    
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

    // Prepare the request body
    const body = new URLSearchParams({
      To: conversation.phone_number,
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

    const smsData = twilioResult;

    console.log('✅ SMS sent successfully via twilio-sms-helper');

    // Log the outbound message
    const { error: logError } = await supabase
      .from('sms_logs')
      .insert({
        conversation_id: conversationId,
        phone_number: conversation.phone_number,
        message_body: message,
        direction: 'outbound',
        status: 'sent',
        twilio_sid: smsData.sid,
        metadata: {
          sent_by: 'admin_reply',
          reply_to_conversation: true
        }
      });

    if (logError) {
      console.error('⚠️ Error logging message:', logError);
    }

    // Update conversation activity
    const { error: updateError } = await supabase
      .from('sms_conversations')
      .update({ 
        last_updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (updateError) {
      console.error('⚠️ Error updating conversation:', updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message_sid: smsData.sid,
        conversation_id: conversationId
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('❌ SMS reply error:', error);
    
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