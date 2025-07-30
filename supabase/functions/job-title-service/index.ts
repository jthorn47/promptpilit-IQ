import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GlobalJobTitle {
  id: string;
  title_name: string;
  description?: string;
  wc_code_id?: string;
  category_tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('❌ No authorization header')
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    )

    const url = new URL(req.url)
    const pathParts = url.pathname.replace('/functions/v1/job-title-service', '').split('/').filter(Boolean)
    const method = req.method

    console.log(`🌐 Job Title Service: ${method} ${url.pathname}`, `Parsed parts:`, pathParts)

    // GET /job-titles - List all job titles
    if (method === 'GET' && (pathParts[0] === 'job-titles' || pathParts.length === 0) && pathParts.length <= 1) {
      const { data, error } = await supabase
        .from('global_job_titles')
        .select('*')
        .order('title_name')

      if (error) {
        console.error('❌ Error fetching job titles:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`✅ Fetched ${data.length} job titles`)
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // GET /job-titles/:id - Get specific job title
    if (method === 'GET' && pathParts[0] === 'job-titles' && pathParts.length === 2) {
      const jobTitleId = pathParts[1]

      const { data, error } = await supabase
        .from('global_job_titles')
        .select('*')
        .eq('id', jobTitleId)
        .maybeSingle()

      if (error) {
        console.error('❌ Error fetching job title:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!data) {
        return new Response(
          JSON.stringify({ error: 'Job title not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`✅ Fetched job title: ${data.title_name}`)
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // POST /job-titles - Create new job title
    if (method === 'POST' && pathParts[0] === 'job-titles' && pathParts.length === 1) {
      const body = await req.json()
      
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('❌ Error getting user:', userError)
        return new Response(
          JSON.stringify({ error: 'Authentication required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const jobTitleData = {
        ...body,
        created_by: user.id
      }

      console.log('📝 Creating job title:', jobTitleData)

      const { data, error } = await supabase
        .from('global_job_titles')
        .insert(jobTitleData)
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating job title:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`✅ Created job title: ${data.title_name}`)
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // PUT /job-titles/:id - Update job title
    if (method === 'PUT' && pathParts[0] === 'job-titles' && pathParts.length === 2) {
      const jobTitleId = pathParts[1]
      const body = await req.json()

      console.log(`📝 Updating job title ${jobTitleId}:`, body)

      const { data, error } = await supabase
        .from('global_job_titles')
        .update(body)
        .eq('id', jobTitleId)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating job title:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`✅ Updated job title: ${data.title_name}`)
      return new Response(
        JSON.stringify(data),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DELETE /job-titles/:id - Delete job title
    if (method === 'DELETE' && pathParts[0] === 'job-titles' && pathParts.length === 2) {
      const jobTitleId = pathParts[1]

      console.log(`🗑️ Deleting job title ${jobTitleId}`)

      const { error } = await supabase
        .from('global_job_titles')
        .delete()
        .eq('id', jobTitleId)

      if (error) {
        console.error('❌ Error deleting job title:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`✅ Deleted job title ${jobTitleId}`)
      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Route not found
    return new Response(
      JSON.stringify({ error: 'Route not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('❌ Job Title Service Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})