import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversationState {
  id: string;
  phone_number: string;
  current_step: string;
  conversation_data: any;
  case_id?: string;
}

interface IntentPattern {
  pattern: string;
  intent_category: string;
  priority_level: string;
  auto_escalate: boolean;
  suggested_response: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 SMS webhook triggered!', req.method, req.url);
    
    const supabaseUrl = 'https://xfamotequcavggiqndfj.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseServiceKey) {
      console.error('❌ Missing Supabase service role key');
      return new Response('<Response></Response>', {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/xml' }
      });
    }

    console.log('✅ Creating Supabase client');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('📋 Parsing form data...');
    const formData = await req.formData();
    
    const from = formData.get('From')?.toString() || '';
    const messageBody = formData.get('Body')?.toString()?.trim() || '';
    const to = formData.get('To')?.toString() || '';
    const messageSid = formData.get('MessageSid')?.toString() || '';

    console.log('📨 Incoming SMS:', { from, messageBody, to, messageSid });

    // Log the incoming message
    try {
      await supabase
        .from('sms_logs')
        .insert({
          phone_number: from,
          message_body: messageBody,
          direction: 'inbound',
          status: 'received',
          twilio_sid: messageSid,
          metadata: {
            to: to,
            received_at: new Date().toISOString()
          }
        });
    } catch (logError) {
      console.error('❌ Failed to log incoming message:', logError);
    }

    // Simple auto-reply for now
    const replyMessage = `Thank you for your message. HALI has received your request: "${messageBody}". Our team will respond shortly.`;
    
    // Send reply using Twilio helper
    try {
      const smsHelperResponse = await supabase.functions.invoke('twilio-sms-helper', {
        body: {
          to: from,
          message: replyMessage,
          client_id: null
        }
      });

      if (smsHelperResponse.error) {
        console.error('❌ SMS send error:', smsHelperResponse.error);
      } else {
        console.log('✅ SMS reply sent successfully');
      }
    } catch (smsError) {
      console.error('❌ Failed to send SMS reply:', smsError);
    }

    // Return empty TwiML response
    return new Response('<Response></Response>', {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
    });

  } catch (error) {
    console.error('❌ SMS Webhook Error:', error);
    
    // Always return 200 with empty TwiML to prevent Twilio retries
    return new Response('<Response></Response>', {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
      },
    });
  }
});

async function getOrCreateConversation(supabase: any, phoneNumber: string): Promise<ConversationState> {
  // Check for existing active conversation
  const { data: existing } = await supabase
    .from('sms_conversations')
    .select('*')
    .eq('phone_number', phoneNumber)
    .eq('is_active', true)
    .order('last_updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) {
    // Check if conversation has timed out (24 hours)
    const lastUpdate = new Date(existing.last_updated_at);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);

    if (hoursSinceUpdate > 24) {
      // Reset conversation but keep memory
      const { data: reset } = await supabase
        .from('sms_conversations')
        .update({
          current_step: 'returning_user',
          timeout_count: existing.timeout_count + 1,
          last_updated_at: now.toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      return reset;
    }

    return existing;
  }

  // Create new conversation
  const { data: newConversation } = await supabase
    .from('sms_conversations')
    .insert({
      phone_number: phoneNumber,
      current_step: 'initial_contact',
      conversation_data: {},
      is_active: true
    })
    .select()
    .single();

  return newConversation;
}

async function analyzeMessageIntent(supabase: any, message: string, conversation: ConversationState): Promise<IntentPattern> {
  const { data: patterns } = await supabase
    .from('intent_patterns')
    .select('*')
    .eq('is_active', true)
    .order('priority_level', { ascending: false });

  const normalizedMessage = message.toLowerCase();

  // Find matching pattern
  for (const pattern of patterns || []) {
    const regex = new RegExp(pattern.pattern, 'i');
    if (regex.test(normalizedMessage)) {
      return pattern;
    }
  }

  // Default pattern for unmatched messages
  return {
    pattern: '',
    intent_category: 'Other',
    priority_level: 'normal',
    auto_escalate: false,
    suggested_response: 'I understand you need help. Let me gather some information to assist you better.'
  };
}

async function processConversationFlow(
  supabase: any, 
  conversation: ConversationState, 
  message: string, 
  intent: IntentPattern
): Promise<any> {
  const step = conversation.current_step;
  const data = conversation.conversation_data || {};

  console.log('🔄 Processing flow:', { step, intent: intent.intent_category });

  switch (step) {
    case 'initial_contact':
      return handleInitialContact(conversation, message, intent);
    
    case 'returning_user':
      return handleReturningUser(supabase, conversation, message, intent);
    
    case 'awaiting_name':
      return handleNameCollection(conversation, message, intent);
    
    case 'awaiting_client':
      return handleClientCollection(conversation, message, intent);
    
    case 'awaiting_issue':
      return handleIssueCollection(conversation, message, intent);
    
    case 'awaiting_hr_decision':
      return handleHRDecision(conversation, message, intent);
    
    case 'case_update_or_new':
      return handleCaseUpdateOrNew(conversation, message, intent);
    
    default:
      return handleDefault(conversation, message, intent);
  }
}

function handleInitialContact(conversation: ConversationState, message: string, intent: IntentPattern): any {
  const hasName = extractNameFromMessage(message);
  
  if (hasName) {
    return {
      message: `Hi ${hasName}! ${intent.suggested_response} What company do you work for?`,
      nextStep: 'awaiting_client',
      conversationData: { employee_name: hasName, intent_category: intent.intent_category },
      createCase: false
    };
  }

  return {
    message: `Hello! I'm HALI, your AI assistant. I'm here to help with HR, Payroll, and Software issues. What's your name?`,
    nextStep: 'awaiting_name',
    conversationData: { intent_category: intent.intent_category },
    createCase: false
  };
}

async function handleReturningUser(supabase: any, conversation: ConversationState, message: string, intent: IntentPattern): Promise<any> {
  // Check if user has open cases
  const { data: openCases } = await supabase
    .from('sms_cases')
    .select('*')
    .eq('phone_number', conversation.phone_number)
    .neq('status', 'closed')
    .order('created_at', { ascending: false });

  if (openCases && openCases.length > 0) {
    return {
      message: `Welcome back! I see you have an open case about ${openCases[0].issue_category}. Would you like to:\n\n1. Update your existing case\n2. Start a new case\n\nJust reply "Update" or "New"`,
      nextStep: 'case_update_or_new',
      conversationData: { 
        existing_case_id: openCases[0].id,
        intent_category: intent.intent_category
      },
      createCase: false
    };
  }

  return {
    message: `Welcome back! ${intent.suggested_response} How can I help you today?`,
    nextStep: 'awaiting_issue',
    conversationData: { 
      employee_name: conversation.conversation_data?.employee_name,
      client_name: conversation.conversation_data?.client_name,
      intent_category: intent.intent_category 
    },
    createCase: false
  };
}

function handleNameCollection(conversation: ConversationState, message: string, intent: IntentPattern): any {
  const name = extractNameFromMessage(message) || message.trim();
  
  return {
    message: `Nice to meet you, ${name}! What company do you work for?`,
    nextStep: 'awaiting_client',
    conversationData: { 
      ...conversation.conversation_data,
      employee_name: name,
      intent_category: intent.intent_category 
    },
    createCase: false
  };
}

function handleClientCollection(conversation: ConversationState, message: string, intent: IntentPattern): any {
  const company = message.trim();
  
  return {
    message: `Got it, ${company}. ${intent.suggested_response} Please describe the issue you're experiencing.`,
    nextStep: 'awaiting_issue',
    conversationData: { 
      ...conversation.conversation_data,
      client_name: company,
      intent_category: intent.intent_category 
    },
    createCase: false
  };
}

function handleIssueCollection(conversation: ConversationState, message: string, intent: IntentPattern): any {
  const needsHR = intent.intent_category === 'HR' || intent.auto_escalate;
  
  if (needsHR) {
    return {
      message: `Thank you for the details. This appears to be an HR matter that needs special attention. I'm creating a priority case and will have someone from HR contact you soon. Is there anything else I can help you with right now?`,
      nextStep: 'complete',
      conversationData: { 
        ...conversation.conversation_data,
        issue_description: message,
        wants_hr: true,
        intent_category: intent.intent_category 
      },
      createCase: true,
      escalate: intent.auto_escalate
    };
  }

  return {
    message: `Thank you for the information. I've created a ${intent.intent_category} case for you. Our team will review it and get back to you soon. Case created successfully! You'll receive updates via text. Is there anything else I can help you with?`,
    nextStep: 'complete',
    conversationData: { 
      ...conversation.conversation_data,
      issue_description: message,
      wants_hr: false,
      intent_category: intent.intent_category 
    },
    createCase: true,
    escalate: false
  };
}

function handleHRDecision(conversation: ConversationState, message: string, intent: IntentPattern): any {
  const wantsHR = message.toLowerCase().trim().startsWith('y');
  
  return {
    message: wantsHR 
      ? `An HR specialist will contact you within 24 hours. Your case has been escalated for priority handling.`
      : `Thank you. Your case has been submitted and will be reviewed by our team.`,
    nextStep: 'complete',
    conversationData: { 
      ...conversation.conversation_data,
      wants_hr: wantsHR,
      intent_category: intent.intent_category 
    },
    createCase: true,
    escalate: wantsHR
  };
}

function handleCaseUpdateOrNew(conversation: ConversationState, message: string, intent: IntentPattern): any {
  const response = message.toLowerCase().trim();
  
  if (response.includes('update') || response === '1') {
    return {
      message: `I'll update your existing case with this new information: "${message}". The team will be notified of the update. Anything else I can help you with?`,
      nextStep: 'complete',
      conversationData: { 
        ...conversation.conversation_data,
        update_message: message,
        intent_category: intent.intent_category 
      },
      updateCase: true,
      createCase: false
    };
  }

  if (response.includes('new') || response === '2') {
    return {
      message: `Starting a new case. Please describe the new issue you're experiencing.`,
      nextStep: 'awaiting_issue',
      conversationData: { 
        ...conversation.conversation_data,
        intent_category: intent.intent_category 
      },
      createCase: false
    };
  }

  return {
    message: `I didn't understand. Please reply "Update" to update your existing case or "New" to start a new case.`,
    nextStep: 'case_update_or_new',
    conversationData: conversation.conversation_data,
    createCase: false
  };
}

function handleDefault(conversation: ConversationState, message: string, intent: IntentPattern): any {
  return {
    message: `I understand you need help. Let me start fresh. What's your name?`,
    nextStep: 'awaiting_name',
    conversationData: { intent_category: intent.intent_category },
    createCase: false
  };
}

async function updateConversationState(
  supabase: any, 
  conversation: ConversationState, 
  nextStep: string, 
  lastMessage: string,
  conversationData: any
): Promise<void> {
  await supabase
    .from('sms_conversations')
    .update({
      current_step: nextStep,
      last_message: lastMessage,
      conversation_data: conversationData,
      last_updated_at: new Date().toISOString()
    })
    .eq('id', conversation.id);
}

async function handleCaseManagement(
  supabase: any,
  conversation: ConversationState,
  intent: IntentPattern,
  message: string,
  response: any
): Promise<void> {
  const data = response.conversationData;

  if (response.createCase) {
    // Create new case
    const { data: newCase } = await supabase
      .from('sms_cases')
      .insert({
        phone_number: conversation.phone_number,
        employee_name: data.employee_name || 'Unknown',
        client_name: data.client_name || 'Unknown',
        issue_category: intent.intent_category,
        status: intent.auto_escalate ? 'escalated' : 'open',
        wants_hr: data.wants_hr || false,
        conversation_step: 5,
        last_message: data.issue_description || message,
        conversation_id: conversation.id
      })
      .select()
      .single();

    // Link case to conversation
    await supabase
      .from('sms_conversations')
      .update({ case_id: newCase.id })
      .eq('id', conversation.id);

    // Trigger AI analysis for the new case
    try {
      console.log('🤖 Triggering AI analysis for new case:', newCase.id);
      
      const analysisResponse = await supabase.functions.invoke('ai-case-analysis', {
        body: {
          caseId: newCase.id,
          description: data.issue_description || message,
          issueCategory: data.issue_category,
          wantsHr: data.wants_hr,
          employeeName: `${data.first_name} ${data.last_name}`,
          clientName: data.company_name,
          conversationHistory: JSON.stringify(conversation.conversation_data)
        }
      });

      if (analysisResponse.error) {
        console.error('❌ AI analysis failed:', analysisResponse.error);
      } else {
        console.log('✅ AI analysis triggered successfully');
      }
    } catch (aiError) {
      console.error('❌ Error triggering AI analysis:', aiError);
      // Don't fail the SMS flow if AI analysis fails
    }

    console.log('✅ Created new case:', newCase.id);
  }

  if (response.updateCase && data.existing_case_id) {
    // Update existing case
    await supabase
      .from('sms_cases')
      .update({
        last_message: data.update_message || message,
        updated_at: new Date().toISOString()
      })
      .eq('id', data.existing_case_id);

    console.log('🔄 Updated existing case:', data.existing_case_id);
  }
}

async function handleEscalation(
  supabase: any,
  conversation: ConversationState,
  intent: IntentPattern,
  message: string
): Promise<void> {
  console.log('🚨 Escalating case for:', conversation.phone_number);
  
  // Log escalation for admin notification
  await supabase
    .from('sms_conversations')
    .update({
      error_flagged: true,
      conversation_data: {
        ...conversation.conversation_data,
        escalation_reason: intent.intent_category,
        escalation_timestamp: new Date().toISOString(),
        urgent_message: message
      }
    })
    .eq('id', conversation.id);
}

function extractNameFromMessage(message: string): string | null {
  const namePatterns = [
    /my name is (\w+)/i,
    /i'm (\w+)/i,
    /im (\w+)/i,
    /this is (\w+)/i,
    /^(\w+)$/,
  ];

  for (const pattern of namePatterns) {
    const match = message.match(pattern);
    if (match && match[1] && match[1].length > 1) {
      return match[1];
    }
  }

  return null;
}
