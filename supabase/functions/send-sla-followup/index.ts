import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FollowUpRequest {
  caseId: string;
  phoneNumber: string;
  employeeName: string;
  issueCategory: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { caseId, phoneNumber, employeeName, issueCategory }: FollowUpRequest = await req.json();

    if (!caseId || !phoneNumber) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: caseId, phoneNumber' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare the follow-up message
    const message = `Hi ${employeeName}, this is HALI from EaseWorks. We're still working on your ${issueCategory} case and haven't forgotten about you. Thank you for your patience - we'll update you soon!`;

    // Send SMS via Twilio
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !fromNumber) {
      throw new Error('Missing Twilio configuration');
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const body = new URLSearchParams({
      From: fromNumber,
      To: phoneNumber,
      Body: message,
    });

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!twilioResponse.ok) {
      const error = await twilioResponse.text();
      throw new Error(`Twilio API error: ${error}`);
    }

    const twilioResult = await twilioResponse.json();
    console.log('Follow-up SMS sent successfully:', twilioResult.sid);

    // Log the follow-up in sms_logs
    const { error: logError } = await supabaseClient
      .from('sms_logs')
      .insert({
        conversation_id: caseId,
        direction: 'outbound',
        message_body: message,
        from_number: fromNumber,
        to_number: phoneNumber,
        twilio_sid: twilioResult.sid,
        message_type: 'sla_followup'
      });

    if (logError) {
      console.error('Error logging follow-up SMS:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Follow-up SMS sent successfully',
        twilioSid: twilioResult.sid
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in send-sla-followup function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to send follow-up SMS', details: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});