import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

interface TwilioWebhookBody {
  From: string;
  To: string;
  Body: string;
  MessageSid: string;
  AccountSid: string;
  MessagingServiceSid?: string;
}

interface HALIFlowState {
  step: string;
  context: any;
  client_name?: string;
  client_id?: string;
  client_matched?: boolean;
  employee_name?: string;
  issue_category?: string;
  wants_hr?: boolean;
  description?: string;
}

Deno.serve(async (req) => {
  console.log('🚀 HALI-HOOK: Function called!', req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('🚀 HALI-HOOK: Returning CORS preflight response');
    return new Response(null, { headers: corsHeaders });
  }

  // Return 200 immediately to test if function is accessible
  if (req.method === 'GET') {
    console.log('🚀 HALI-HOOK: GET request received - function is working!');
    return new Response('HALI Hook is working!', { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'text/plain' } 
    });
  }

  try {
    console.log('🚀 HALI Hook processing POST request');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse the incoming webhook
    const formData = await req.formData();
    const twilioData: TwilioWebhookBody = {
      From: formData.get('From') as string,
      To: formData.get('To') as string,
      Body: formData.get('Body') as string,
      MessageSid: formData.get('MessageSid') as string,
      AccountSid: formData.get('AccountSid') as string,
      MessagingServiceSid: formData.get('MessagingServiceSid') as string,
    };

    console.log('📱 HALI Webhook received from:', twilioData.From);

    // Get or create SMS conversation
    let { data: conversation, error: convError } = await supabase
      .from('sms_conversations')
      .select('*')
      .eq('phone_number', twilioData.From)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (convError && convError.code !== 'PGRST116') {
      console.error('❌ Error fetching conversation:', convError);
      return new Response('Internal Server Error', { status: 500 });
    }

    let conversationId: string;

    if (!conversation) {
      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('sms_conversations')
        .insert({
          phone_number: twilioData.From,
          conversation_step: 'awaiting_client',
          current_step: 'awaiting_client',
          conversation_data: {},
          is_active: true
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creating conversation:', createError);
        return new Response('Internal Server Error', { status: 500 });
      }
      
      conversation = newConv;
      conversationId = newConv.id;
      console.log('🆕 Created new conversation for:', twilioData.From);
    } else {
      conversationId = conversation.id;
    }

    // Log inbound message
    const { error: logError } = await supabase
      .from('sms_logs')
      .insert({
        conversation_id: conversationId,
        phone_number: twilioData.From,
        message_body: twilioData.Body,
        direction: 'inbound',
        twilio_sid: twilioData.MessageSid,
        metadata: {
          to: twilioData.To,
          account_sid: twilioData.AccountSid,
          messaging_service_sid: twilioData.MessagingServiceSid
        }
      });

    if (logError) {
      console.error('❌ Error logging inbound message:', logError);
    }

    // Process message through HALI flow engine
    const flowState: HALIFlowState = conversation.conversation_data || {};
    const currentStep = conversation.current_step || 'awaiting_client';
    const messageBody = twilioData.Body.trim();

    let nextStep = currentStep;
    let responseMessage = '';
    let shouldCreateCase = false;

    console.log(`🔄 Processing step: ${currentStep}`);

    // HALI Flow Engine Logic
    switch (currentStep) {
      case 'awaiting_client':
        const companyName = messageBody.trim();
        flowState.client_name = companyName;
        
        const { data: clientData } = await supabase
          .from('clients')
          .select('id, company_name')
          .ilike('company_name', `%${companyName}%`)
          .limit(1)
          .single();

        if (clientData) {
          flowState.client_id = clientData.id;
          flowState.client_matched = true;
          responseMessage = `Great! I found ${clientData.company_name} in our system. Now, what's your full name?`;
        } else {
          flowState.client_matched = false;
          responseMessage = `Thanks! I noted your company as "${companyName}". We'll verify this later. What's your full name?`;
        }
        
        nextStep = 'awaiting_name';
        break;

      case 'awaiting_name':
        flowState.employee_name = messageBody.trim();
        nextStep = 'awaiting_issue';
        responseMessage = `Hi ${flowState.employee_name}! What type of issue are you experiencing? Please choose:\n\n1 - Payroll\n2 - HR Question\n3 - Software/Technical\n4 - Other\n\nReply with the number or describe your issue.`;
        break;

      case 'awaiting_issue':
        const issueMap: Record<string, string> = {
          '1': 'Payroll',
          '2': 'HR',
          '3': 'Software',
          '4': 'Other'
        };

        let issueCategory = issueMap[messageBody] || 'Other';
        
        const msgLower = messageBody.toLowerCase();
        if (!issueMap[messageBody]) {
          if (msgLower.includes('payroll') || msgLower.includes('pay') || msgLower.includes('wage')) {
            issueCategory = 'Payroll';
          } else if (msgLower.includes('hr') || msgLower.includes('human') || msgLower.includes('benefits')) {
            issueCategory = 'HR';
          } else if (msgLower.includes('software') || msgLower.includes('login') || msgLower.includes('technical') || msgLower.includes('system')) {
            issueCategory = 'Software';
          }
        }
        
        flowState.issue_category = issueCategory;
        flowState.description = messageBody.trim();
        nextStep = 'awaiting_hr_confirm';
        responseMessage = `I understand you have a ${issueCategory} issue: "${messageBody}"\n\nWould you like to speak to an HR specialist about this? Reply YES or NO.`;
        break;

      case 'awaiting_hr_confirm':
        const wantsHr = messageBody.toLowerCase().includes('yes') || messageBody.toLowerCase().includes('y');
        flowState.wants_hr = wantsHr;
        
        nextStep = 'case_created';
        shouldCreateCase = true;
        
        if (wantsHr) {
          responseMessage = `Perfect! I've created your case and flagged it for HR specialist review. Your case details:\n\n📋 Company: ${flowState.client_name}\n👤 Name: ${flowState.employee_name}\n📱 Phone: ${twilioData.From}\n🏷️ Category: ${flowState.issue_category}\n🚩 HR Review: Yes\n\nOur HR team will contact you soon!`;
        } else {
          responseMessage = `Thank you! I've created your support case. Your case details:\n\n📋 Company: ${flowState.client_name}\n👤 Name: ${flowState.employee_name}\n📱 Phone: ${twilioData.From}\n🏷️ Category: ${flowState.issue_category}\n\nOur team will review and get back to you shortly.`;
        }
        break;

      case 'case_created':
        responseMessage = `Your case has been submitted successfully! If you have another issue, text me again and I'll help you create a new case. Have a great day! 😊`;
        nextStep = 'completed';
        break;

      default:
        nextStep = 'awaiting_client';
        responseMessage = `Hi! I'm HALI 🤖, your AI assistant. I'm here to help create support cases for your workplace issues.\n\nWhat company do you work for?`;
        Object.keys(flowState).forEach(key => delete flowState[key]);
        break;
    }

    // Create Pulse case if needed
    if (shouldCreateCase) {
      const { data: caseData, error: caseError } = await supabase
        .from('pulse_cases')
        .insert({
          client_id: flowState.client_id || null,
          client_name: flowState.client_name || 'Unknown Company',
          employee_name: flowState.employee_name || 'Unknown Employee',
          phone_number: twilioData.From,
          category: flowState.issue_category || 'Other',
          description: flowState.description || 'No description provided',
          status: 'Open',
          priority: flowState.wants_hr ? 'High' : 'Medium',
          wants_hr: flowState.wants_hr || false,
          conversation_id: conversation.id,
          metadata: {
            created_via: 'hali_sms',
            twilio_message_sid: twilioData.MessageSid,
            flow_context: flowState,
            client_matched: flowState.client_matched
          }
        })
        .select()
        .single();

      if (caseError) {
        console.error('❌ Error creating Pulse case:', caseError);
      } else {
        console.log('✅ Created Pulse case:', caseData.case_number);
        
        await supabase
          .from('sms_conversations')
          .update({ case_id: caseData.id })
          .eq('id', conversation.id);
      }
    }

    // Update conversation
    const { error: updateError } = await supabase
      .from('sms_conversations')
      .update({
        current_step: nextStep,
        conversation_data: flowState,
        last_message_at: new Date().toISOString()
      })
      .eq('id', conversation.id);

    if (updateError) {
      console.error('❌ Error updating conversation:', updateError);
    }

    // Send response via Twilio helper
    try {
      await supabase.functions.invoke('twilio-sms-helper', {
        body: {
          to: twilioData.From,
          message: responseMessage
        }
      });

      // Log outbound message
      await supabase
        .from('sms_logs')
        .insert({
          conversation_id: conversation.id,
          phone_number: twilioData.From,
          message_body: responseMessage,
          direction: 'outbound',
          metadata: {
            step: nextStep,
            response_to_sid: twilioData.MessageSid
          }
        });

      console.log('✅ HALI response sent');
    } catch (sendError) {
      console.error('❌ Error sending response:', sendError);
    }

    // Return TwiML response
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml'
        }
      }
    );

  } catch (error) {
    console.error('❌ HALI webhook error:', error);
    
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/xml'
        }
      }
    );
  }
});