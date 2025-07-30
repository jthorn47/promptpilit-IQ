import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 Search real photos function called');
  console.log('📥 Request method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('⚡ CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('📦 Parsing request body...');
    const { prompt, title, description } = await req.json();
    console.log('📝 Received data:', { 
      hasPrompt: !!prompt, 
      hasTitle: !!title, 
      hasDescription: !!description,
      title: title?.substring(0, 50),
      description: description?.substring(0, 50)
    });

    if (!prompt && !title) {
      console.error('❌ Missing required data: need either prompt or title');
      return new Response(
        JSON.stringify({ error: 'Either prompt or title is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create search query based on input - prioritize custom prompt
    let searchQuery;
    if (prompt && prompt.trim()) {
      searchQuery = prompt.trim();
      console.log('🎯 Using custom prompt:', searchQuery);
    } else {
      searchQuery = `${title} training workplace business professional`;
      if (description) {
        searchQuery += ` ${description}`;
      }
      console.log('🔧 Generated query from title/description:', searchQuery);
    }

    // Get OpenAI API key
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('❌ OpenAI API key not found - falling back to basic search');
      return await fallbackImageSearch(searchQuery);
    }

    console.log('🤖 Using OpenAI to analyze prompt and generate search terms...');
    
    // Use OpenAI to analyze the prompt and generate relevant search terms
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at analyzing text prompts and generating relevant image search terms. Generate exactly 6 different, specific search terms that would find professional, business, or training-related stock photos. Each search term should be 2-4 words maximum. Return only a JSON array of 6 search terms, nothing else.'
          },
          {
            role: 'user',
            content: `Analyze this prompt and generate 6 specific image search terms: "${searchQuery}"`
          }
        ],
        temperature: 0.7,
        max_tokens: 200
      }),
    });

    if (!openAIResponse.ok) {
      console.error('🚨 OpenAI API error:', openAIResponse.status);
      return await fallbackImageSearch(searchQuery);
    }

    const openAIData = await openAIResponse.json();
    let searchTerms;
    
    try {
      const aiResponse = openAIData.choices[0].message.content.trim();
      console.log('🤖 OpenAI response:', aiResponse);
      searchTerms = JSON.parse(aiResponse);
      
      if (!Array.isArray(searchTerms) || searchTerms.length < 6) {
        throw new Error('Invalid search terms from AI');
      }
    } catch (parseError) {
      console.error('🚨 Failed to parse OpenAI response:', parseError);
      return await fallbackImageSearch(searchQuery);
    }

    console.log('🔍 AI-generated search terms:', searchTerms);

    // Generate exactly 6 unique images using AI-generated search terms
    const workplaceImages = await generateSixUniqueImages(searchTerms);

    console.log(`✅ Successfully generated ${workplaceImages.length} images using AI-powered search`);
    return new Response(
      JSON.stringify({ 
        images: workplaceImages,
        totalFound: workplaceImages.length,
        searchQuery: searchQuery,
        aiSearchTerms: searchTerms,
        source: 'openai_powered_search',
        note: 'Images found using AI-powered analysis of your custom prompt for maximum relevance!'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('💥 Unexpected error in search-real-photos function:', error);
    console.error('💥 Error stack:', error.stack);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Fallback function when OpenAI is not available
async function fallbackImageSearch(searchQuery: string) {
  console.log('🔄 Using fallback search method');
  
  const encodedQuery = encodeURIComponent(searchQuery.replace(/[^\w\s]/gi, ' ').trim());
  const timestamp = Date.now();
  const randomSeed = Math.floor(Math.random() * 10000);
  
  const photoUrls = [
    `https://source.unsplash.com/1024x576/?${encodedQuery}&${timestamp}`,
    `https://source.unsplash.com/1024x576/?${encodedQuery}&${timestamp + 1}`,
    `https://source.unsplash.com/1024x576/?${encodedQuery}&${timestamp + 2}`,
    `https://picsum.photos/1024/576?random=${randomSeed}`,
    `https://picsum.photos/1024/576?random=${randomSeed + 100}`,
    `https://picsum.photos/1024/576?random=${randomSeed + 200}`
  ];
  
  const workplaceImages = photoUrls.map((url, index) => ({
    id: index + 1,
    image: url,
    prompt: `Search result ${index + 1} for: ${searchQuery}`
  }));

  return new Response(
    JSON.stringify({ 
      images: workplaceImages,
      totalFound: workplaceImages.length,
      searchQuery: searchQuery,
      source: 'fallback_search',
      note: 'Using basic search - add OpenAI API key for AI-powered image discovery!'
    }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Function to generate exactly 6 unique images with retry logic
async function generateSixUniqueImages(searchTerms: string[]) {
  const images = [];
  const usedUrls = new Set();
  const timestamp = Date.now();
  
  // First pass: use the 6 AI-generated search terms
  for (let i = 0; i < 6 && i < searchTerms.length; i++) {
    const term = encodeURIComponent(searchTerms[i].trim());
    const url = `https://source.unsplash.com/1024x576/?${term}&${timestamp + i}`;
    
    if (!usedUrls.has(url)) {
      images.push({
        id: i + 1,
        image: url,
        prompt: `AI-selected: ${searchTerms[i]}`
      });
      usedUrls.add(url);
    }
  }
  
  // Second pass: add variations if we need more images
  let counter = 100;
  while (images.length < 6 && counter < 200) {
    const randomTerm = searchTerms[Math.floor(Math.random() * searchTerms.length)];
    const encodedTerm = encodeURIComponent(randomTerm);
    const url = `https://source.unsplash.com/1024x576/?${encodedTerm}&${timestamp + counter}`;
    
    if (!usedUrls.has(url)) {
      images.push({
        id: images.length + 1,
        image: url,
        prompt: `AI-variation: ${randomTerm}`
      });
      usedUrls.add(url);
    }
    counter++;
  }
  
  // Third pass: use Picsum as absolute fallback to ensure 6 images
  const randomBase = Math.floor(Math.random() * 10000);
  while (images.length < 6) {
    const url = `https://picsum.photos/1024/576?random=${randomBase + images.length}`;
    images.push({
      id: images.length + 1,
      image: url,
      prompt: `Professional image ${images.length + 1}`
    });
  }
  
  return images.slice(0, 6); // Ensure exactly 6 images
}