import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to get OpenAI API key from integrations
async function getOpenAIApiKey() {
  console.log('🔍 Starting to get OpenAI API key from integration...');
  
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  
  console.log('🔑 Environment check:', { 
    hasUrl: !!supabaseUrl, 
    hasServiceKey: !!supabaseServiceKey 
  });
  
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables');
    return null;
  }
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // First get the OpenAI provider ID
  console.log('🔍 Looking for OpenAI provider...');
  const { data: provider, error: providerError } = await supabase
    .from('integration_providers')
    .select('id')
    .eq('name', 'openai')
    .single();

  console.log('📊 Provider query result:', { provider, providerError });

  if (providerError || !provider) {
    console.error('❌ Failed to find OpenAI provider:', providerError);
    return null;
  }

  // Then get the active integration
  console.log('🔍 Looking for active OpenAI integration with provider_id:', provider.id);
  const { data: integration, error } = await supabase
    .from('integrations')
    .select('credentials')
    .eq('status', 'active')
    .eq('provider_id', provider.id)
    .single();

  console.log('📊 Integration query result:', { 
    integration: integration ? 'found' : 'not found', 
    hasApiKey: !!integration?.credentials?.api_key,
    error 
  });

  if (error || !integration?.credentials?.api_key) {
    console.error('❌ Failed to get OpenAI API key from integration:', error);
    return null;
  }

  console.log('✅ Successfully retrieved OpenAI API key from integration');
  return integration.credentials.api_key;
}

serve(async (req) => {
  console.log('🚀 generate-blog-content function called');
  console.log('📝 Request method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🔍 Getting OpenAI API key from integration...');
  // Get OpenAI API key from integration
  const openAIApiKey = await getOpenAIApiKey();
  
  if (!openAIApiKey) {
    return new Response(
      JSON.stringify({ error: 'OpenAI integration not configured. Please connect OpenAI in the Integration Hub.' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    const { type, title, excerpt, category, existingContent } = await req.json();

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'title':
        systemPrompt = 'You are an expert content writer. Generate compelling, SEO-friendly blog post titles that grab attention and drive engagement.';
        userPrompt = `Generate a compelling blog post title for a workplace training and compliance blog. The title should:
- Be engaging and attention-grabbing
- Include relevant keywords for SEO
- Be between 50-60 characters
- Focus on workplace safety, compliance training, or harassment prevention topics

Context: ${category ? `Category: ${category}` : 'General workplace training content'}

Generate just the title, nothing else.`;
        break;

      case 'excerpt':
        systemPrompt = 'You are an expert content writer specializing in workplace training and compliance content. Create compelling excerpts that encourage readers to read the full post.';
        userPrompt = `Create a compelling excerpt for this blog post:
Title: ${title}
${category ? `Category: ${category}` : ''}

The excerpt should:
- Be 150-160 characters maximum
- Summarize the key value proposition
- Encourage readers to continue reading
- Include relevant keywords naturally

Generate just the excerpt, nothing else.`;
        break;

      case 'outline':
        systemPrompt = 'You are an expert content strategist for workplace training and compliance. Create structured, comprehensive blog post outlines.';
        userPrompt = `Create a detailed blog post outline for:
Title: ${title}
${excerpt ? `Excerpt: ${excerpt}` : ''}
${category ? `Category: ${category}` : ''}

Create a structured outline with:
- Introduction paragraph
- 3-5 main sections with descriptive headings
- Key points to cover in each section
- Conclusion paragraph
- Call-to-action suggestions

Format as markdown with clear headings and bullet points for key points to cover.`;
        break;

      case 'full-post':
        systemPrompt = 'You are an expert content writer specializing in workplace training, compliance, and employee safety. Write comprehensive, engaging blog posts that provide real value to HR professionals and business owners.';
        userPrompt = `Write a comprehensive blog post about:
Title: ${title}
${excerpt ? `Excerpt: ${excerpt}` : ''}
${category ? `Category: ${category}` : ''}
${existingContent ? `Existing content/outline: ${existingContent}` : ''}

Requirements:
- Write 1500-2000 words
- Use engaging, professional tone
- Include practical tips and actionable advice
- Add relevant examples and scenarios
- Structure with clear headings and subheadings
- Include a strong introduction and conclusion
- Add a call-to-action at the end
- Focus on workplace safety, compliance training, harassment prevention, or related topics
- Use markdown formatting for headings, lists, and emphasis

Write the complete blog post content in markdown format.`;
        break;

      default:
        throw new Error('Invalid content type specified');
    }

    console.log('Generating content with OpenAI:', { type, title });

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
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: type === 'full-post' ? 4000 : 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Content generated successfully');

    // Return appropriate response based on type
    let result: any = {};
    
    switch (type) {
      case 'title':
        result.title = generatedContent.trim();
        break;
      case 'excerpt':
        result.excerpt = generatedContent.trim();
        break;
      case 'outline':
      case 'full-post':
        result.content = generatedContent.trim();
        // For full posts, also generate an excerpt if none provided
        if (type === 'full-post' && !excerpt) {
          const excerptLines = generatedContent.split('\n').filter(line => 
            line.length > 50 && line.length < 200 && !line.startsWith('#')
          );
          if (excerptLines.length > 0) {
            result.excerpt = excerptLines[0].substring(0, 160) + '...';
          }
        }
        break;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-blog-content function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate content', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});