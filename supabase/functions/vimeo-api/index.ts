import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json()
    console.log('Request body:', requestBody)
    const { endpoint, params = {}, action = 'get', videoIds = [] } = requestBody
    
    // Get Vimeo access token from secrets
    const vimeoAccessToken = Deno.env.get('VIMEO_ACCESS_TOKEN')
    console.log('Token check:', vimeoAccessToken ? `Token present (${vimeoAccessToken.length} chars)` : 'Token missing')
    
    if (!vimeoAccessToken) {
      throw new Error('VIMEO_ACCESS_TOKEN not configured')
    }

    // Handle bulk delete action
    if (action === 'bulkDelete' && videoIds.length > 0) {
      const results = []
      
      for (const videoId of videoIds) {
        try {
          const deleteResponse = await fetch(`https://api.vimeo.com/videos/${videoId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${vimeoAccessToken}`,
              'Accept': 'application/vnd.vimeo.*+json;version=3.4',
            }
          })
          
          results.push({
            videoId,
            success: deleteResponse.ok,
            status: deleteResponse.status,
            message: deleteResponse.ok ? 'Deleted successfully' : `Failed to delete: ${deleteResponse.statusText}`
          })
          
          console.log(`Delete video ${videoId}: ${deleteResponse.status}`)
        } catch (error: any) {
          results.push({
            videoId,
            success: false,
            status: 0,
            message: `Error: ${error.message}`
          })
        }
      }
      
      return new Response(
        JSON.stringify({ results }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      )
    }

    // Build API URL - for videos endpoint, we need to use /me/videos
    const baseUrl = 'https://api.vimeo.com'
    let apiEndpoint = endpoint
    
    // Map generic endpoints to specific Vimeo API paths
    if (endpoint === 'videos') {
      apiEndpoint = 'me/videos'
    }
    
    const url = new URL(`${baseUrl}/${apiEndpoint}`)
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value))
      }
    })

    console.log('Vimeo API Request:', url.toString())

    // Make request to Vimeo API
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${vimeoAccessToken}`,
        'Accept': 'application/vnd.vimeo.*+json;version=3.4',
        'User-Agent': 'EaseBase/1.0'
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Vimeo API Error:', response.status, errorText)
      
      let errorMessage = 'Vimeo API request failed'
      try {
        const errorData = JSON.parse(errorText)
        errorMessage = errorData.error || errorData.error_description || errorMessage
      } catch (e) {
        errorMessage = errorText || errorMessage
      }

      throw new Error(`${errorMessage} (Status: ${response.status})`)
    }

    const data = await response.json()
    console.log('Vimeo API Response:', data.paging || 'Success')

    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    )

  } catch (error) {
    console.error('Error in vimeo-api function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      },
    )
  }
})