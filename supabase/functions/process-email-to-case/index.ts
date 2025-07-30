import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailData {
  email_id: string;
  subject: string;
  from: string;
  to: string;
  content: string;
  received_at: string;
  message_id?: string;
  thread_id?: string;
  company_domain?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const emailData: EmailData = await req.json();
    
    console.log('Processing email:', emailData.email_id);

    // Check if email already processed
    const { data: existingMapping } = await supabaseClient
      .from('email_case_mappings')
      .select('*')
      .eq('email_id', emailData.email_id)
      .single();

    if (existingMapping) {
      return new Response(
        JSON.stringify({ message: 'Email already processed', case_id: existingMapping.case_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get AI decision on whether to create a case
    const aiDecision = await analyzeEmailForCase(emailData);
    
    // Log AI processing
    await supabaseClient
      .from('ai_case_processing_log')
      .insert({
        email_id: emailData.email_id,
        email_subject: emailData.subject,
        email_from: emailData.from,
        email_content: emailData.content,
        ai_decision: aiDecision.decision,
        ai_reasoning: aiDecision.reasoning,
        confidence_score: aiDecision.confidence,
        processing_duration_ms: aiDecision.processingTime
      });

    let caseId = null;

    if (aiDecision.decision === 'create_case' || aiDecision.decision === 'auto_close') {
      // Create case
      const caseResult = await createCaseFromEmail(supabaseClient, emailData, aiDecision);
      caseId = caseResult.case_id;

      // Create email-case mapping
      await supabaseClient
        .from('email_case_mappings')
        .insert({
          email_id: emailData.email_id,
          case_id: caseId,
          email_message_id: emailData.message_id,
          email_thread_id: emailData.thread_id
        });

      // If auto-close, close the case immediately
      if (aiDecision.decision === 'auto_close') {
        await supabaseClient
          .from('cases')
          .update({ 
            status: 'closed',
            closed_at: new Date().toISOString(),
            internal_notes: `Auto-closed by AI: ${aiDecision.reasoning}`
          })
          .eq('id', caseId);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        decision: aiDecision.decision,
        case_id: caseId,
        reasoning: aiDecision.reasoning,
        confidence: aiDecision.confidence
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing email:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process email' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

async function analyzeEmailForCase(emailData: EmailData) {
  const startTime = Date.now();
  
  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `
Analyze this email and determine if it requires a support case to be created.

Email Details:
- From: ${emailData.from}
- Subject: ${emailData.subject}
- Content: ${emailData.content}

Consider these factors:
1. Is this a genuine support request or customer inquiry?
2. Does it require human intervention or can it be auto-resolved?
3. Is it spam, promotional, or automated content?
4. Is it urgent or high priority?

Respond with JSON in this format:
{
  "decision": "create_case" | "auto_close" | "no_case_needed" | "needs_review",
  "reasoning": "Brief explanation of your decision",
  "confidence": 0.95,
  "suggested_priority": "high" | "medium" | "low",
  "suggested_type": "general_support" | "technical" | "billing" | "hr",
  "auto_close_reason": "Only if decision is auto_close"
}

Guidelines:
- "create_case": Genuine support requests needing human attention
- "auto_close": Simple questions that can be answered immediately (FAQ-type)
- "no_case_needed": Spam, promotional emails, or clearly not support-related
- "needs_review": Uncertain cases that need human review
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);
    
    return {
      ...aiResponse,
      processingTime: Date.now() - startTime
    };

  } catch (error) {
    console.error('Error analyzing email with AI:', error);
    // Fallback decision
    return {
      decision: 'needs_review',
      reasoning: 'AI analysis failed, requires manual review',
      confidence: 0.0,
      suggested_priority: 'medium',
      suggested_type: 'general_support',
      processingTime: Date.now() - startTime
    };
  }
}

async function createCaseFromEmail(supabaseClient: any, emailData: EmailData, aiDecision: any) {
  // Extract company domain from email
  const domain = emailData.from.split('@')[1];
  
  // Try to find related company
  const { data: company } = await supabaseClient
    .from('company_settings')
    .select('id, company_name')
    .ilike('company_name', `%${domain.split('.')[0]}%`)
    .single();

  const caseData = {
    title: emailData.subject || 'Email Support Request',
    description: `Email received from: ${emailData.from}\n\nContent:\n${emailData.content}`,
    type: aiDecision.suggested_type || 'general_support',
    priority: aiDecision.suggested_priority || 'medium',
    status: 'open',
    source: 'email',
    visibility: 'internal',
    client_viewable: false,
    tags: ['email-generated', 'auto-processed'],
    estimated_hours: 1,
    actual_hours: 0,
    related_company_id: company?.id,
    related_contact_email: emailData.from,
    external_reference: emailData.email_id
  };

  const { data: newCase, error } = await supabaseClient
    .from('cases')
    .insert([caseData])
    .select()
    .single();

  if (error) {
    console.error('Error creating case:', error);
    throw error;
  }

  // Create initial activity
  await supabaseClient
    .from('case_activities')
    .insert({
      case_id: newCase.id,
      activity_type: 'email',
      content: `Case created from email: ${emailData.subject}`,
      metadata: {
        email_id: emailData.email_id,
        email_from: emailData.from,
        ai_decision: aiDecision.decision,
        ai_reasoning: aiDecision.reasoning
      }
    });

  console.log(`Case created: ${newCase.id} from email ${emailData.email_id}`);
  
  return { case_id: newCase.id };
}