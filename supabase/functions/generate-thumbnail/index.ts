import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('🚀 Generate thumbnail function called');
  console.log('📥 Request method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('⚡ CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔑 Checking OpenAI API key...');
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      console.error('❌ OPENAI_API_KEY not found in environment');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    console.log('✅ OpenAI API key found');

    console.log('📦 Parsing request body...');
    const { prompt, title, description, moduleType, moduleId } = await req.json();
    console.log('📝 Received data:', { 
      hasPrompt: !!prompt, 
      hasTitle: !!title, 
      hasDescription: !!description,
      moduleType,
      moduleId,
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

    // Create a detailed prompt for thumbnail generation
    let imagePrompt;
    if (prompt) {
      // For module thumbnails, enhance the prompt with module-specific context
      if (moduleType && moduleId) {
        imagePrompt = `Professional corporate stock photography for ${title} module: ${prompt}. Module category: ${moduleType}. CRITICAL: This must look like genuine corporate stock photography from Getty Images or Shutterstock. Real human models only, professional lighting, authentic business environments. NO AI-generated faces, NO digital art, NO synthetic people. Modern professional aesthetic, high-quality business setting.`;
      } else {
        imagePrompt = `Stock photography style image: ${prompt}. CRITICAL: This must look like genuine corporate stock photography from Getty Images or Shutterstock. Real human models only, professional lighting, authentic business environments. NO AI-generated faces, NO digital art, NO synthetic people.`;
      }
    } else {
      if (moduleType && moduleId) {
        imagePrompt = `High-quality corporate stock photography for "${title}" platform module.`;
        if (description) {
          imagePrompt += ` Module function: ${description}.`;
        }
        imagePrompt += ` Category: ${moduleType} module. CRITICAL REQUIREMENTS: This must be authentic stock photography style with real human models in professional business settings. Use natural lighting, genuine office environments, and authentic workplace interactions. Focus on ${moduleType} industry themes and professional workflows. The image should look indistinguishable from premium corporate stock photography. NO AI-generated faces, NO digital artwork, NO synthetic people. Professional corporate environment only. 16:9 aspect ratio for module thumbnail.`;
      } else {
        imagePrompt = `High-quality corporate stock photography for "${title}" training module.`;
        if (description) {
          imagePrompt += ` Training topic: ${description}.`;
        }
        imagePrompt += ` CRITICAL REQUIREMENTS: This must be authentic stock photography style with real human models in professional business settings. Use natural lighting, genuine office environments, and authentic workplace interactions. The image should look indistinguishable from premium corporate stock photography from Getty Images, Shutterstock, or Adobe Stock. NO AI-generated faces, NO digital artwork, NO synthetic people, NO obviously computer-generated content. Professional corporate headshots and business scenarios only. 16:9 aspect ratio for video thumbnail.`;
      }
    }

    console.log('🎨 Generated image prompt:', imagePrompt);
    console.log('🌐 Making 6 OpenAI API requests for thumbnail variations...');

    // Generate 6 different thumbnails with unique variations based on the title
    const thumbnailPromises = [];
    const titleLower = title?.toLowerCase() || 'business training';
    const variations = [
      `${imagePrompt} - Focus on ${titleLower} concept with diverse professionals in modern office setting`,
      `${imagePrompt} - Minimalist design representing ${titleLower} with clean business graphics and icons`,
      `${imagePrompt} - Team collaboration scene specifically for ${titleLower} training, professional environment`,
      `${imagePrompt} - Abstract business visualization of ${titleLower} concepts, modern corporate design`,
      `${imagePrompt} - Professional workplace scenario demonstrating ${titleLower} principles, authentic business setting`,
      `${imagePrompt} - Creative interpretation of ${titleLower} theme with contemporary business aesthetics`
    ];

    for (let i = 0; i < 6; i++) {
      const promise = fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: variations[i],
          n: 1,
          size: '1024x1024',
          quality: 'hd',
          response_format: 'b64_json'
        }),
      });
      thumbnailPromises.push(promise);
    }

    console.log('⏳ Waiting for all 6 thumbnail generations to complete...');
    const responses = await Promise.all(thumbnailPromises);
    
    console.log('📡 All OpenAI API responses received');
    const images = [];
    
    for (let i = 0; i < responses.length; i++) {
      const response = responses[i];
      console.log(`📊 Response ${i + 1} status:`, response.status);
      
      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ OpenAI API error for image ${i + 1}:`, error);
        // Continue with other images even if one fails
        continue;
      }

      const data = await response.json();
      const imageData = data.data[0].b64_json;
      images.push({
        id: i + 1,
        image: `data:image/png;base64,${imageData}`,
        prompt: variations[i]
      });
    }

    console.log(`✅ Successfully generated ${images.length} thumbnails`);
    
    if (images.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate any thumbnails' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    console.log('✅ Returning successful response with multiple thumbnails');
    return new Response(
      JSON.stringify({ 
        images: images,
        totalGenerated: images.length,
        prompt: imagePrompt 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('💥 Unexpected error in generate-thumbnail function:', error);
    console.error('💥 Error stack:', error.stack);
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});