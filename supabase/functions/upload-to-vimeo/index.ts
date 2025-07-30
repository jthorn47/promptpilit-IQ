import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Helper function to format duration from seconds to human readable format
function formatDuration(seconds: number): string {
  if (!seconds || seconds === 0) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const vimeoAccessToken = Deno.env.get('VIMEO_ACCESS_TOKEN');
    console.log('🔑 Vimeo token check:', vimeoAccessToken ? `Token present (${vimeoAccessToken.length} chars)` : 'Token missing');
    
    if (!vimeoAccessToken) {
      console.error('❌ VIMEO_ACCESS_TOKEN not found in environment');
      throw new Error('VIMEO_ACCESS_TOKEN not configured in Supabase secrets');
    }

    const requestData = await req.json();
    const { action = 'createTicket', fileName, fileSize, title, description, query } = requestData;
    
    console.log(`Processing ${action} request`, { fileName, fileSize, query });

    // Test token first
    if (action === 'testToken') {
      console.log('🔍 Testing Vimeo token...');
      try {
        const testResponse = await fetch('https://api.vimeo.com/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${vimeoAccessToken}`,
            'Accept': 'application/vnd.vimeo.*+json;version=3.4',
          },
        });
        
        console.log('📥 Token test response:', {
          status: testResponse.status,
          statusText: testResponse.statusText
        });
        
        if (testResponse.ok) {
          const userData = await testResponse.json();
          return new Response(JSON.stringify({
            success: true,
            message: 'Token is valid',
            user: userData.name || userData.link
          }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          const errorText = await testResponse.text();
          return new Response(JSON.stringify({
            success: false,
            error: `Token test failed: ${testResponse.status} - ${errorText}`
          }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      } catch (error: any) {
        return new Response(JSON.stringify({
          success: false,
          error: `Token test error: ${error.message}`
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    if (action === 'createTicket') {
      if (!fileName || !fileSize) {
        return new Response(
          JSON.stringify({ success: false, error: 'fileName and fileSize are required for ticket creation' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Creating Vimeo upload ticket for file: ${fileName}, size: ${fileSize} bytes`);

      const requestBody = {
        upload: {
          approach: 'tus',
          size: fileSize,
        },
        name: title || fileName,
        description: description || `Training video uploaded from ${fileName}`,
        privacy: {
          view: 'unlisted',
        },
        tags: ['training', 'easelearn']
      };
      
      console.log('📤 Sending request to Vimeo API:', {
        url: 'https://api.vimeo.com/me/videos',
        headers: {
          'Authorization': `Bearer ${vimeoAccessToken.substring(0, 10)}...`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.vimeo.*+json;version=3.4',
        },
        body: requestBody
      });

      // Create Vimeo upload ticket
      const uploadTicketResponse = await fetch('https://api.vimeo.com/me/videos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${vimeoAccessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.vimeo.*+json;version=3.4',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📥 Vimeo API response:', {
        status: uploadTicketResponse.status,
        statusText: uploadTicketResponse.statusText,
        headers: Object.fromEntries(uploadTicketResponse.headers.entries())
      });

      if (!uploadTicketResponse.ok) {
        const errorText = await uploadTicketResponse.text();
        console.error('❌ Vimeo API error details:', {
          status: uploadTicketResponse.status,
          statusText: uploadTicketResponse.statusText,
          errorBody: errorText
        });
        throw new Error(`Failed to create Vimeo upload ticket: ${uploadTicketResponse.status} - ${errorText}`);
      }

      const uploadTicket = await uploadTicketResponse.json();
      console.log('Upload ticket created:', uploadTicket.uri);

      const videoId = uploadTicket.uri.split('/').pop();
      const uploadUrl = uploadTicket.upload.upload_link;

      return new Response(JSON.stringify({
        success: true,
        videoId,
        uploadUrl,
        message: 'Upload ticket created successfully'
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    if (action === 'search') {
      if (!query) {
        return new Response(
          JSON.stringify({ success: false, error: 'query is required for search' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Searching Vimeo videos for: ${query}`);

      // Search user's Vimeo videos
      const searchResponse = await fetch(`https://api.vimeo.com/me/videos?query=${encodeURIComponent(query)}&per_page=50`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${vimeoAccessToken}`,
          'Accept': 'application/vnd.vimeo.*+json;version=3.4',
        },
      });

      if (!searchResponse.ok) {
        const errorText = await searchResponse.text();
        console.error('Failed to search videos:', errorText);
        throw new Error(`Failed to search Vimeo videos: ${searchResponse.status}`);
      }

      const searchData = await searchResponse.json();
      console.log(`Found ${searchData.data?.length || 0} videos`);

      // Format the response for the UI
      const videos = searchData.data?.map((video: any) => ({
        id: video.uri.split('/').pop(),
        name: video.name,
        description: video.description,
        duration: formatDuration(video.duration),
        embedUrl: `https://player.vimeo.com/video/${video.uri.split('/').pop()}`,
        thumbnail: video.pictures?.sizes?.[2]?.link || null
      })) || [];

      return new Response(JSON.stringify({
        success: true,
        videos,
        message: `Found ${videos.length} videos`
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      });
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Invalid action specified. Supported actions: createTicket, search' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Vimeo upload error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Failed to process Vimeo request'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
});