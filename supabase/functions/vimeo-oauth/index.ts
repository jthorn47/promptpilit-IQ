import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('=== Vimeo OAuth Function Started ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)

  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight')
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Processing request...')
    
    let requestBody;
    try {
      const bodyText = await req.text()
      console.log('Request body text:', bodyText)
      requestBody = JSON.parse(bodyText)
      console.log('Parsed request body:', requestBody)
    } catch (error) {
      console.error('Failed to parse request body:', error)
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    const { action, page = 1, perPage = 20 } = requestBody
    console.log('Action requested:', action)

    const vimeoAccessToken = Deno.env.get('VIMEO_ACCESS_TOKEN')
    console.log('Token check:', {
      hasToken: !!vimeoAccessToken,
      tokenLength: vimeoAccessToken ? vimeoAccessToken.length : 0,
      tokenPrefix: vimeoAccessToken ? vimeoAccessToken.substring(0, 8) + '...' : 'none'
    })

    if (!vimeoAccessToken) {
      console.error('VIMEO_ACCESS_TOKEN not found in environment')
      return new Response(
        JSON.stringify({ 
          error: 'Missing VIMEO_ACCESS_TOKEN - Please add your Vimeo personal access token to Supabase secrets',
          details: 'Environment variable VIMEO_ACCESS_TOKEN not set'
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'getUserVideos') {
      console.log('Fetching user videos...')
      
      const videosResponse = await fetch(`https://api.vimeo.com/me/videos?page=${page}&per_page=${perPage}&sort=date&direction=desc&fields=uri,name,description,duration,pictures,privacy,created_time,embed`, {
        headers: {
          'Authorization': `Bearer ${vimeoAccessToken}`,
          'Accept': 'application/vnd.vimeo.*+json;version=3.4'
        },
      })

      if (!videosResponse.ok) {
        const errorText = await videosResponse.text()
        console.error('Vimeo API error:', videosResponse.status, errorText)
        return new Response(
          JSON.stringify({ error: `Failed to fetch videos: ${videosResponse.status} ${errorText}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const videosData = await videosResponse.json()
      console.log('Fetched videos:', videosData.data?.length || 0)
      
      const videos = videosData.data?.map((video: any) => ({
        id: video.uri.split('/').pop(),
        name: video.name,
        description: video.description,
        duration: video.duration,
        embed: video.embed?.html,
        thumbnail: video.pictures?.sizes?.[2]?.link || video.pictures?.sizes?.[0]?.link,
        privacy: video.privacy?.view,
        created_time: video.created_time,
      })) || []

      return new Response(
        JSON.stringify({
          videos,
          total: videosData.total || 0,
          page: videosData.page || 1,
          per_page: videosData.per_page || perPage,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'getVideoDetails') {
      const { videoId } = requestBody
      if (!videoId) {
        return new Response(
          JSON.stringify({ error: 'Video ID is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log('Fetching video details for ID:', videoId)
      
      const videoResponse = await fetch(`https://api.vimeo.com/videos/${videoId}?fields=uri,name,description,duration,pictures,privacy,created_time,embed`, {
        headers: {
          'Authorization': `Bearer ${vimeoAccessToken}`,
          'Accept': 'application/vnd.vimeo.*+json;version=3.4'
        },
      })

      if (!videoResponse.ok) {
        const errorText = await videoResponse.text()
        console.error('Vimeo API error:', videoResponse.status, errorText)
        return new Response(
          JSON.stringify({ error: `Failed to fetch video details: ${videoResponse.status}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const videoData = await videoResponse.json()
      
      const video = {
        id: videoData.uri.split('/').pop(),
        name: videoData.name,
        description: videoData.description,
        duration: videoData.duration,
        embed: videoData.embed?.html,
        thumbnail: videoData.pictures?.sizes?.[2]?.link || videoData.pictures?.sizes?.[0]?.link,
        privacy: videoData.privacy?.view,
        created_time: videoData.created_time,
      }

      return new Response(
        JSON.stringify({ video }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'testConnection') {
      console.log('Testing Vimeo connection...')
      
      const userResponse = await fetch('https://api.vimeo.com/me?fields=uri,name,link', {
        headers: {
          'Authorization': `Bearer ${vimeoAccessToken}`,
          'Accept': 'application/vnd.vimeo.*+json;version=3.4'
        },
      })

      if (!userResponse.ok) {
        const errorText = await userResponse.text()
        console.error('Vimeo API error:', userResponse.status, errorText)
        return new Response(
          JSON.stringify({ error: `Failed to connect to Vimeo: ${userResponse.status}`, details: errorText }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const userData = await userResponse.json()
      
      return new Response(
        JSON.stringify({
          success: true,
          user: {
            id: userData.uri.split('/').pop(),
            name: userData.name,
            link: userData.link,
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Unknown error occurred',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})