import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

interface StartConversationRequest {
  phone_number: string;
  message: string;
  vault_file_id?: string;
  employee_id?: string;
  pulse_case_id?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      phone_number, 
      message, 
      vault_file_id, 
      employee_id, 
      pulse_case_id 
    }: StartConversationRequest = await req.json();

    console.log('🚀 Starting HALI conversation:', { phone_number, message });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get Twilio provider first
    const { data: twilioProvider, error: providerError } = await supabase
      .from('integration_providers')
      .select('id')
      .eq('name', 'twilio')
      .single();

    if (providerError || !twilioProvider) {
      console.error('❌ Twilio provider not found:', providerError);
      throw new Error('Twilio integration provider not configured.');
    }

    // Get Twilio credentials from integrations table
    const { data: twilioIntegrations, error: credentialsError } = await supabase
      .from('integrations')
      .select('credentials')
      .eq('provider_id', twilioProvider.id)
      .eq('status', 'active');

    if (credentialsError || !twilioIntegrations?.length) {
      console.error('❌ No Twilio credentials found:', credentialsError);
      throw new Error('Twilio integration not configured. Please set up Twilio in Integration Hub.');
    }

    const twilioConfig = twilioIntegrations[0].credentials as {
      account_sid: string;
      auth_token: string;
      phone_number?: string;
      messaging_service_sid?: string;
    };

    if (!twilioConfig.account_sid || !twilioConfig.auth_token) {
      throw new Error('Twilio credentials incomplete. Please check your Integration Hub configuration.');
    }

    // Determine the "from" parameter  
    let fromPhone: string;
    if (twilioConfig.messaging_service_sid) {
      fromPhone = twilioConfig.messaging_service_sid;
    } else if (twilioConfig.phone_number) {
      fromPhone = twilioConfig.phone_number;
    } else {
      throw new Error('No Twilio phone number or messaging service configured. Please update your Integration Hub settings.');
    }

    // Phone number should already be properly formatted from frontend
    const formattedPhone = phone_number;

    // Prepare message content with vault file link if provided
    let finalMessage = message;
    if (vault_file_id) {
      // Generate tokenized vault link with 24-hour expiry
      const token = crypto.randomUUID();
      const vaultLink = `https://vault.haalo.com/share/${token}`;
      finalMessage += `\n\n📎 File: ${vaultLink}\n(Link expires in 24 hours)`;
    }

    // Create SMS conversation record
    const { data: conversationData, error: convError } = await supabase
      .from('sms_conversations')
      .insert({
        phone_number: formattedPhone,
        conversation_step: 'initial_contact',
        current_step: 'initial_contact',
        conversation_data: {
          initiated_by: 'admin',
          vault_file_id: vault_file_id || null,
          started_from: pulse_case_id ? 'pulse_case' : 'hali_dashboard'
        },
        is_active: true
      })
      .select()
      .single();

    if (convError) {
      console.error('Error creating conversation:', convError);
      throw new Error('Failed to create conversation record');
    }

    console.log('📝 Conversation created:', conversationData.id);

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioConfig.account_sid}/Messages.json`;
    const auth = btoa(`${twilioConfig.account_sid}:${twilioConfig.auth_token}`);

    const bodyParams = new URLSearchParams({
      To: formattedPhone,
      Body: finalMessage,
    });

    // Add the appropriate "from" parameter
    if (twilioConfig.messaging_service_sid) {
      bodyParams.append('MessagingServiceSid', twilioConfig.messaging_service_sid);
    } else {
      bodyParams.append('From', twilioConfig.phone_number!);
    }

    const smsResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: bodyParams,
    });

    if (!smsResponse.ok) {
      const errorText = await smsResponse.text();
      console.error('Twilio SMS failed:', errorText);
      throw new Error(`Failed to send SMS: ${errorText}`);
    }

    const smsData = await smsResponse.json();
    console.log('📱 SMS sent successfully:', smsData.sid);

    // Log the outbound message
    const { error: logError } = await supabase
      .from('sms_logs')
      .insert({
        conversation_id: conversationData.id,
        phone_number: formattedPhone,
        message_body: finalMessage,
        direction: 'outbound',
        status: 'sent',
        twilio_sid: smsData.sid,
        metadata: {
          sent_by: 'admin',
          vault_file_attached: !!vault_file_id,
          message_segments: smsData.num_segments || 1
        }
      });

    if (logError) {
      console.error('Error logging message:', logError);
    }

    // Log to case events if triggered from Pulse Case
    if (pulse_case_id) {
      const { error: caseLogError } = await supabase
        .from('case_events')
        .insert({
          case_id: pulse_case_id,
          event_type: 'sms_sent',
          description: `SMS conversation started with ${formattedPhone}`,
          source: 'HALI',
          metadata: {
            conversation_id: conversationData.id,
            phone_number: formattedPhone,
            message_preview: message.substring(0, 100),
            vault_file_attached: !!vault_file_id
          }
        });

      if (caseLogError) {
        console.error('Error logging to case events:', caseLogError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        conversation_id: conversationData.id,
        sms_sid: smsData.sid,
        phone_number: formattedPhone
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('Error in start-hali-conversation:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});