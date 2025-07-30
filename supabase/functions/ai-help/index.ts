import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get relevant knowledge base articles
    const { data: articles, error } = await supabase
      .from('knowledge_base_articles')
      .select('title, content, category, tags')
      .eq('status', 'published')
      .textSearch('title', question)
      .limit(5);

    if (error) {
      console.error('Error fetching articles:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch knowledge base' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Build context from articles
    const context = articles?.map(article => 
      `Title: ${article.title}\nCategory: ${article.category}\nContent: ${article.content}\n---`
    ).join('\n') || '';

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant for EaseBase, an internal learning management system. Help staff understand system features and functionality. Use the knowledge base context provided to give accurate, helpful responses. Keep responses concise but comprehensive.

Knowledge Base Context:
${context}`
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      }),
    });

    const openaiData = await openaiResponse.json();
    const response = openaiData.choices[0].message.content;

    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-help function:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});