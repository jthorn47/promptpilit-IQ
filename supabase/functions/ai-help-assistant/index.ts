import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

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
    const { message } = await req.json();
    
    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Search knowledge base for relevant articles
    const { data: articles, error: searchError } = await supabase
      .from('knowledge_base_articles')
      .select('title, content, category, tags')
      .eq('status', 'published')
      .or(`title.ilike.%${message}%, content.ilike.%${message}%`)
      .limit(5);

    if (searchError) {
      console.error('Knowledge base search error:', searchError);
    }

    // Prepare context from knowledge base
    let context = '';
    if (articles && articles.length > 0) {
      context = articles.map(article => 
        `Title: ${article.title}\nCategory: ${article.category}\nContent: ${article.content}\n---`
      ).join('\n');
    }

    // Prepare OpenAI prompt
    const systemPrompt = `You are an AI assistant for EaseBase, an enterprise learning management system. Your role is to help internal staff understand the features and functionality of the platform.

Knowledge Base Context:
${context}

Guidelines:
- Provide clear, helpful responses about EaseBase features
- Use the knowledge base content when available
- If the knowledge base doesn't contain relevant information, provide general guidance
- Keep responses concise but comprehensive
- Use bullet points and formatting for clarity
- Include specific steps when explaining processes
- Always maintain a helpful, professional tone

If you don't have specific information about a feature, say so and suggest contacting support or checking the full documentation.`;

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      return new Response(JSON.stringify({ error: 'Failed to get AI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I cannot provide a response at this time.';

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-help-assistant function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});