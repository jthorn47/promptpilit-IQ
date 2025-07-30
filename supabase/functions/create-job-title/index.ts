import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateJobTitleRequest {
  title_name: string;
  wc_code_id?: string;
  client_id?: string;
  start_date?: string;
  end_date?: string;
  is_global?: boolean;
  category?: string;
  is_available_for_clients?: boolean;
  description?: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const {
      title_name,
      wc_code_id,
      client_id,
      start_date,
      end_date,
      is_global = false,
      category,
      is_available_for_clients = true,
      description
    }: CreateJobTitleRequest = await req.json();

    console.log('Creating job title:', { title_name, is_global, client_id });

    // Create job title
    const { data: jobTitle, error: jobTitleError } = await supabaseClient
      .from('job_titles')
      .insert({
        title_name,
        wc_code_id,
        client_id,
        start_date,
        end_date,
        is_global,
        category,
        is_available_for_clients,
        created_by: user.id
      })
      .select()
      .single();

    if (jobTitleError) {
      console.error('Error creating job title:', jobTitleError);
      return new Response(
        JSON.stringify({ error: 'Failed to create job title' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create job description if provided
    if (description && description.trim()) {
      const { error: descriptionError } = await supabaseClient
        .from('job_descriptions')
        .insert({
          job_title_id: jobTitle.id,
          description: description.trim(),
          is_ai_generated: false,
          created_by: user.id
        });

      if (descriptionError) {
        console.error('Error creating job description:', descriptionError);
        // Don't fail the whole operation, just log the error
      }
    }

    // Fetch the complete job title with relations
    const { data: completeJobTitle, error: fetchError } = await supabaseClient
      .from('job_titles')
      .select(`
        *,
        workers_comp_codes:wc_code_id(id, code, description),
        company_settings:client_id(id, company_name),
        job_descriptions(id, description, is_ai_generated, created_at)
      `)
      .eq('id', jobTitle.id)
      .single();

    if (fetchError) {
      console.error('Error fetching complete job title:', fetchError);
      return new Response(
        JSON.stringify({ jobTitle }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        jobTitle: completeJobTitle,
        message: 'Job title created successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in create-job-title function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});