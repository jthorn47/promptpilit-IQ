import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 test-openai-integration function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Starting OpenAI integration test...');
    
    // First try to get API key from environment variable (synced from integration)
    let openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    
    console.log('🔑 Environment API key check:', !!openaiApiKey);

    if (!openaiApiKey) {
      console.log('❌ No API key in environment, integration may not be synced yet');
      throw new Error('OpenAI API key not found. Please reconnect your OpenAI integration.');
    }

    // Test OpenAI API call
    console.log('🌐 Testing OpenAI API call...');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: 'Say "Hello from OpenAI integration test!"'
          }
        ],
        max_tokens: 50
      }),
    });
    console.log('📊 OpenAI response status:', openAIResponse.status);

    if (!openAIResponse.ok) {
      const errorData = await openAIResponse.text();
      console.error('❌ OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorData}`);
    }

    const aiData = await openAIResponse.json();
    const response = aiData.choices[0].message.content;

    console.log('✅ OpenAI integration test successful');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'OpenAI integration test successful',
        response: response
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
    console.error('❌ Full error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: 'Check function logs for more details'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});