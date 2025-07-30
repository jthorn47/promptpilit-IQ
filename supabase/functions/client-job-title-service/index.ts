import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const pathSegments = url.pathname.replace('/functions/v1/client-job-title-service', '').split('/').filter(Boolean);
    const method = req.method;

    console.log(`${method} request to client-job-title-service:`, url.pathname, 'Parsed segments:', pathSegments);

    // Handle POST requests to root path (for backwards compatibility)
    if (method === 'POST' && pathSegments.length === 0) {
      const body = await req.json();
      console.log('POST body:', body);

      // If this is a simple request, return job titles for the client
      if (body.client_id && !body.action) {
        const { data: jobTitles, error } = await supabase
          .from('client_job_titles')
          .select(`
            *,
            workers_comp_codes (
              id,
              code,
              description,
              rate
            ),
            global_job_descriptions (
              id,
              title,
              description
            )
          `)
          .eq('client_id', body.client_id)
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching job titles:', error);
          return new Response(
            JSON.stringify({ error: 'Failed to fetch job titles' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ data: jobTitles }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Handle action-based requests
      if (body.action) {
        switch (body.action) {
          case 'get_job_titles':
            // Same as above
            const { data: jobTitles, error } = await supabase
              .from('client_job_titles')
              .select(`
                *,
                workers_comp_codes (
                  id,
                  code,
                  description,
                  rate
                ),
                global_job_descriptions (
                  id,
                  title,
                  description
                )
              `)
              .eq('client_id', body.client_id)
              .eq('is_active', true)
              .order('created_at', { ascending: false });

            if (error) {
              console.error('Error fetching job titles:', error);
              return new Response(
                JSON.stringify({ error: 'Failed to fetch job titles' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }

            return new Response(
              JSON.stringify({ data: jobTitles }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );

          default:
            return new Response(
              JSON.stringify({ error: 'Unknown action' }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }
      }
    }

    // GET /client-job-titles?client_id={id}
    if (method === 'GET' && pathSegments.length === 0) {
      const clientId = url.searchParams.get('client_id');
      
      if (!clientId) {
        return new Response(
          JSON.stringify({ error: 'client_id parameter is required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: jobTitles, error } = await supabase
        .from('client_job_titles')
        .select(`
          *,
          workers_comp_codes (
            id,
            code,
            description,
            rate
          ),
          global_job_descriptions (
            id,
            title,
            description
          )
        `)
        .eq('client_id', clientId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching job titles:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch job titles' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data: jobTitles }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // GET /client-job-titles/{id}/available-wc-codes
    if (method === 'GET' && pathSegments.length === 2 && pathSegments[1] === 'available-wc-codes') {
      const clientId = pathSegments[0];

      const { data: wcCodes, error } = await supabase
        .from('workers_comp_codes')
        .select('*')
        .order('code');

      if (error) {
        console.error('Error fetching WC codes:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch workers comp codes' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data: wcCodes }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // POST /client-job-titles
    if (method === 'POST' && pathSegments.length === 0) {
      const body = await req.json();
      const { client_id, title, effective_date, wc_code_id, job_description_id, custom_description } = body;

      // Get current user from auth header
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(
          JSON.stringify({ error: 'Authorization required' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );

      if (authError || !user) {
        return new Response(
          JSON.stringify({ error: 'Invalid authorization' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const { data: jobTitle, error } = await supabase
        .from('client_job_titles')
        .insert({
          client_id,
          title,
          effective_date,
          wc_code_id,
          job_description_id,
          custom_description,
          created_by: user.id
        })
        .select(`
          *,
          workers_comp_codes (
            id,
            code,
            description,
            rate
          ),
          global_job_descriptions (
            id,
            title,
            description
          )
        `)
        .single();

      if (error) {
        console.error('Error creating job title:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create job title' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data: jobTitle }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PUT /client-job-titles/{id}
    if (method === 'PUT' && pathSegments.length === 1) {
      const jobTitleId = pathSegments[0];
      const body = await req.json();
      const { title, effective_date, wc_code_id, job_description_id, custom_description } = body;

      const { data: jobTitle, error } = await supabase
        .from('client_job_titles')
        .update({
          title,
          effective_date,
          wc_code_id,
          job_description_id,
          custom_description
        })
        .eq('id', jobTitleId)
        .select(`
          *,
          workers_comp_codes (
            id,
            code,
            description,
            rate
          ),
          global_job_descriptions (
            id,
            title,
            description
          )
        `)
        .single();

      if (error) {
        console.error('Error updating job title:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update job title' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ data: jobTitle }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // DELETE /client-job-titles/{id}
    if (method === 'DELETE' && pathSegments.length === 1) {
      const jobTitleId = pathSegments[0];

      const { error } = await supabase
        .from('client_job_titles')
        .update({ is_active: false })
        .eq('id', jobTitleId);

      if (error) {
        console.error('Error deleting job title:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to delete job title' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});