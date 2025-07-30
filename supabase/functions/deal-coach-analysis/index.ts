import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, threadMessages, proposalSummary } = await req.json();

    // Build context for GPT analysis
    const threadContext = threadMessages.map((msg: any) => 
      `${msg.sender} (${msg.timestamp}): ${msg.subject}\n${msg.content}`
    ).join('\n\n');

    const currentEmailContext = `Current Email - ${email.sender} (${email.timestamp}): ${email.subject}\n${email.content}`;

    const proposalContext = proposalSummary ? 
      `Proposal Status: ${proposalSummary.status}, Value: $${proposalSummary.value}, Days Active: ${proposalSummary.daysActive}, Last Activity: ${proposalSummary.lastActivity}` : 
      'No proposal data available';

    const systemPrompt = `You are an AI sales coach analyzing email threads for deal progression. Your role is to provide actionable insights based on:

1. Email content and tone analysis
2. Response patterns and timing
3. Proposal status and engagement
4. Historical sales patterns

Return your analysis in this JSON format:
{
  "nextStep": "Specific recommended action",
  "riskLevel": "low|medium|high",
  "riskReason": "Brief explanation of risk assessment",
  "coachingTip": "Specific coaching advice with example language",
  "confidence": 75,
  "actionItems": ["item1", "item2", "item3"]
}

Focus on:
- Communication gaps and timing
- Tone analysis of recent emails
- Proposal engagement signals
- Best practices for deal progression
- Specific language suggestions`;

    const userPrompt = `Analyze this sales email thread and provide coaching recommendations:

PROPOSAL CONTEXT:
${proposalContext}

THREAD HISTORY:
${threadContext}

CURRENT EMAIL:
${currentEmailContext}

EMAIL TAGS: ${email.tags.join(', ')}

Provide specific, actionable coaching based on this context.`;

    console.log('Sending coaching analysis request to OpenAI...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API Error:', error);
      throw new Error(`OpenAI API Error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    console.log('OpenAI Response received successfully');

    const aiResponse = data.choices[0].message.content;
    
    // Parse JSON response
    let coachingAnalysis;
    try {
      coachingAnalysis = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback response if JSON parsing fails
      coachingAnalysis = {
        nextStep: "Follow up with a personalized message addressing the prospect's specific needs",
        riskLevel: "medium",
        riskReason: "Analysis could not be completed, manual review recommended",
        coachingTip: "Consider reaching out with a value-focused message that highlights specific benefits for their situation",
        confidence: 50,
        actionItems: [
          "Review the email thread for key points",
          "Identify the prospect's main concerns",
          "Prepare a targeted follow-up message",
          "Schedule a follow-up reminder"
        ]
      };
    }

    console.log('Coaching analysis generated successfully');

    return new Response(JSON.stringify(coachingAnalysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in deal-coach-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate coaching analysis',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});