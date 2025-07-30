import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FollowUpRequest {
  proposalId: string;
  status: 'sent' | 'opened' | 'responded' | 'no_response';
  companyName: string;
  daysSinceSent: number;
  lastActivity?: string;
  proposalType: 'propgen' | 'pdf';
}

interface FollowUpResponse {
  suggestions: {
    subject: string;
    body: string;
    tone: 'friendly' | 'professional' | 'urgent';
    type: 'check_in' | 'feedback_request' | 'recap' | 'reminder';
  }[];
}

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { proposalId, status, companyName, daysSinceSent, lastActivity, proposalType }: FollowUpRequest = await req.json();

    console.log('Generating follow-up for proposal:', { proposalId, status, companyName, daysSinceSent });

    // Generate context-aware follow-up suggestions
    const followUpPrompt = createFollowUpPrompt(status, companyName, daysSinceSent, lastActivity, proposalType);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are a professional sales follow-up assistant. Generate thoughtful, personalized follow-up email suggestions for proposal communications. Always be professional, helpful, and respectful of the recipient's time.

Return your response as a JSON object with a "suggestions" array containing 2-3 different follow-up options. Each suggestion should have:
- subject: Email subject line
- body: Email body text (keep it concise, 2-3 paragraphs max)
- tone: Either "friendly", "professional", or "urgent"
- type: Either "check_in", "feedback_request", "recap", or "reminder"`
          },
          {
            role: 'user',
            content: followUpPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const aiData = await response.json();
    
    if (!aiData.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    const suggestions = JSON.parse(aiData.choices[0].message.content);

    // Log the follow-up generation
    await supabase
      .from('proposal_events')
      .insert({
        proposal_id: proposalId,
        event_type: 'viewed', // Using existing enum
        event_data: {
          type: 'ai_followup_generated',
          suggestions_count: suggestions.suggestions?.length || 0,
          status,
          days_since_sent: daysSinceSent
        }
      });

    console.log('Follow-up suggestions generated successfully');

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-proposal-followup function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        suggestions: [{
          subject: "Following up on our proposal",
          body: "I wanted to follow up on the proposal we sent. Do you have any questions or would you like to discuss next steps?",
          tone: "professional",
          type: "check_in"
        }]
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

function createFollowUpPrompt(
  status: string, 
  companyName: string, 
  daysSinceSent: number, 
  lastActivity?: string,
  proposalType?: string
): string {
  const baseContext = `
Company: ${companyName}
Proposal Status: ${status}
Days since sent: ${daysSinceSent}
Proposal Type: ${proposalType === 'propgen' ? 'PropGEN generated' : 'PDF document'}
${lastActivity ? `Last Activity: ${lastActivity}` : ''}
`;

  switch (status) {
    case 'sent':
      return `${baseContext}

The proposal was sent ${daysSinceSent} days ago but hasn't been opened yet. Generate follow-up suggestions that:
1. Are friendly and non-pushy
2. Offer to clarify or provide additional information
3. Suggest a brief call to discuss
4. Check if they received the proposal properly`;

    case 'opened':
      return `${baseContext}

The proposal has been viewed but no response received. Generate follow-up suggestions that:
1. Ask for feedback on the proposal
2. Offer to address any questions or concerns
3. Suggest next steps or timeline discussion
4. Provide additional value or case studies`;

    case 'responded':
      return `${baseContext}

The client has responded to the proposal. Generate follow-up suggestions that:
1. Recap key discussion points
2. Suggest scheduling a meeting
3. Provide next steps or timeline
4. Address any concerns mentioned`;

    case 'no_response':
      return `${baseContext}

No response has been received for several days. Generate follow-up suggestions that:
1. Are respectful of their time
2. Offer different communication channels
3. Provide a clear call to action
4. Suggest alternative approaches if needed`;

    default:
      return `${baseContext}

Generate professional follow-up suggestions for this proposal.`;
  }
}