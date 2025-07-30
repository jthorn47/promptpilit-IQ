import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateJobTitleRequest {
  job_title_id: string;
  title_name?: string;
  wc_code_id?: string;
  start_date?: string;
  end_date?: string;
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
      job_title_id,
      title_name,
      wc_code_id,
      start_date,
      end_date,
      category,
      is_available_for_clients,
      description
    }: UpdateJobTitleRequest = await req.json();

    console.log('Updating job title:', job_title_id);

    // Prepare update data, only including provided fields
    const updateData: any = {};
    if (title_name !== undefined) updateData.title_name = title_name;
    if (wc_code_id !== undefined) updateData.wc_code_id = wc_code_id;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (category !== undefined) updateData.category = category;
    if (is_available_for_clients !== undefined) updateData.is_available_for_clients = is_available_for_clients;

    // Update job title
    const { data: jobTitle, error: updateError } = await supabaseClient
      .from('job_titles')
      .update(updateData)
      .eq('id', job_title_id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating job title:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update job title' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Handle description update if provided
    if (description !== undefined) {
      const { error: descError } = await supabaseClient.functions.invoke('attach-job-description', {
        body: {
          job_title_id,
          description,
          is_ai_generated: false
        }
      });

      if (descError) {
        console.error('Error updating description:', descError);
        // Don't fail the whole operation for description errors
      }
    }

    // Fetch the complete updated job title
    const { data: completeJobTitle, error: fetchError } = await supabaseClient
      .from('job_titles')
      .select(`
        *,
        workers_comp_codes:wc_code_id(id, code, description),
        company_settings:client_id(id, company_name),
        job_descriptions(id, description, is_ai_generated, created_at)
      `)
      .eq('id', job_title_id)
      .single();

    if (fetchError) {
      console.error('Error fetching updated job title:', fetchError);
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
        message: 'Job title updated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in update-job-title function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});