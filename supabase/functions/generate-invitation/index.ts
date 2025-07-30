import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequest {
  companyName: string;
  contactName: string;
  industry?: string;
  companySize?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      companyName,
      contactName,
      industry,
      companySize
    }: InvitationRequest = await req.json();
    
    console.log('Generating AI invitation for:', companyName, 'in industry:', industry);

    // Create industry-specific prompt
    const prompt = `
Create a professional, personalized invitation email for a 10 Minute HR Risk Assessment. 

Company Details:
- Company: ${companyName}
- Contact Name: ${contactName}
- Industry: ${industry || 'General Business'}
- Size: ${companySize || 'Not specified'}

Requirements:
1. Write a compelling, professional email that speaks directly to ${industry || 'business'} industry challenges
2. Highlight specific HR risks common in the ${industry || 'business'} industry
3. Explain how the 10 minute assessment helps companies like ${companyName}
4. Keep it concise but persuasive
5. Include industry-specific examples and pain points
6. Maintain a consultative, helpful tone
7. Focus on the value proposition for ${industry || 'business'} companies

The email should:
- Address ${contactName} personally
- Reference ${companyName} specifically
- Mention relevant ${industry || 'business'} industry compliance requirements
- Highlight potential cost savings and risk reduction
- Position Easeworks as industry experts
- Create urgency around HR compliance

Write only the email body content, no subject line. Make it sound like it's from an experienced HR consultant who understands the ${industry || 'business'} industry.
`;

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
            content: 'You are an expert HR consultant with deep knowledge of industry-specific HR challenges and compliance requirements. Write compelling, personalized business communication that drives action.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('AI invitation content generated successfully');

    return new Response(JSON.stringify({ 
      content: generatedContent,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-invitation function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});