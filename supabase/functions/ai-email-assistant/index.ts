import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailMessage {
  id: string;
  subject: string;
  sender: string;
  body: string;
  timestamp: string;
}

interface AIRequest {
  type: 'summary' | 'suggestions' | 'rewrite' | 'polish' | 'draft' | 'subject' | 'search_intent';
  emails: EmailMessage[];
  rewriteStyle?: 'shorter' | 'friendlier' | 'direct' | 'formal';
  originalText?: string;
  draftContent?: string;
  context?: string;
  searchQuery?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { type, emails, rewriteStyle, originalText, draftContent, context, searchQuery }: AIRequest = await req.json();

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'summary':
        systemPrompt = 'You are an email assistant that provides concise, actionable summaries of email conversations. Focus on key decisions, action items, and important context.';
        userPrompt = `Summarize this email thread in 1-2 sentences, highlighting the main topic and any action items:\n\n${emails.map(email => `From: ${email.sender}\nSubject: ${email.subject}\nBody: ${email.body}\n---`).join('\n')}`;
        break;
        
      case 'suggestions':
        systemPrompt = 'You are an email assistant that generates smart, contextually appropriate reply suggestions. Provide 2-3 brief, professional response options.';
        userPrompt = `Based on this email thread, suggest 2-3 brief reply options (confirm, decline, follow-up, etc.):\n\n${emails.map(email => `From: ${email.sender}\nSubject: ${email.subject}\nBody: ${email.body}\n---`).join('\n')}`;
        break;
        
      case 'rewrite':
        systemPrompt = `You are an email assistant that rewrites text to be ${rewriteStyle}. Maintain the core message while adjusting the tone and style.`;
        userPrompt = `Rewrite this email to be ${rewriteStyle}:\n\n${originalText}`;
        break;
        
      case 'polish':
        systemPrompt = 'You are an email assistant that polishes and improves draft emails. Fix grammar, improve clarity, enhance professionalism, and maintain the original tone and intent.';
        userPrompt = `Polish this email draft to make it more professional and clear:\n\n${draftContent}`;
        break;
        
      case 'draft':
        systemPrompt = 'You are an email assistant that creates professional email drafts from bullet points or rough outlines. Write clear, well-structured emails that address all points mentioned.';
        userPrompt = `Create a professional email draft from these bullet points or outline:\n\n${draftContent}\n\nContext: ${context || 'General business communication'}`;
        break;
        
      case 'subject':
        systemPrompt = 'You are an email assistant that generates clear, concise, and engaging subject lines for emails. Make them specific and actionable.';
        userPrompt = `Generate 3 subject line options for this email content:\n\n${draftContent}\n\nContext: ${context || 'Business email'}`;
        break;
        
      case 'search_intent':
        systemPrompt = 'You are an email search assistant. Parse natural language search queries into structured search filters and provide email summaries.';
        userPrompt = `Parse this search query into structured filters and provide summaries for the provided emails:
        
Search Query: "${searchQuery}"

Available emails:
${emails.map(email => `ID: ${email.id}\nFrom: ${email.sender}\nSubject: ${email.subject}\nBody: ${email.body}\n---`).join('\n')}

Please respond with a JSON object containing:
{
  "searchFilters": {
    "from": "sender email if mentioned",
    "subject": "subject keywords if mentioned", 
    "content": "content keywords if mentioned",
    "timeframe": "time period if mentioned"
  },
  "emailSummaries": [
    {
      "id": "email_id",
      "summary": "brief summary of how this email relates to the search query",
      "relevance": "high/medium/low"
    }
  ],
  "queryUnderstood": true/false
}`;
        break;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: type === 'summary' ? 150 : 300,
        temperature: 0.7,
        stream: false
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'OpenAI API error');
    }

    const content = data.choices[0].message.content;

    if (type === 'suggestions') {
      // Parse suggestions from the response
      const suggestions = content.split('\n').filter(line => line.trim()).slice(0, 3);
      return new Response(JSON.stringify({ suggestions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (type === 'subject') {
      // Parse subject line suggestions from the response
      const subjects = content.split('\n').filter(line => line.trim()).slice(0, 3);
      return new Response(JSON.stringify({ subjects }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (type === 'search_intent') {
      // Parse the JSON response for search intent
      try {
        const searchResult = JSON.parse(content);
        return new Response(JSON.stringify(searchResult), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (e) {
        // If JSON parsing fails, return a fallback response
        return new Response(JSON.stringify({ 
          queryUnderstood: false, 
          searchFilters: {}, 
          emailSummaries: [] 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-email-assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});