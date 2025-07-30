import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AttachJobDescriptionRequest {
  job_title_id: string;
  description: string;
  is_ai_generated?: boolean;
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
      description,
      is_ai_generated = false
    }: AttachJobDescriptionRequest = await req.json();

    console.log('Attaching job description to job title:', job_title_id);

    // Check if description already exists
    const { data: existingDescription } = await supabaseClient
      .from('job_descriptions')
      .select('id')
      .eq('job_title_id', job_title_id)
      .single();

    let result;

    if (existingDescription) {
      // Update existing description
      const { data, error } = await supabaseClient
        .from('job_descriptions')
        .update({
          description,
          is_ai_generated,
          updated_at: new Date().toISOString()
        })
        .eq('job_title_id', job_title_id)
        .select()
        .single();

      result = data;
      if (error) {
        console.error('Error updating job description:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update job description' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    } else {
      // Create new description
      const { data, error } = await supabaseClient
        .from('job_descriptions')
        .insert({
          job_title_id,
          description,
          is_ai_generated,
          created_by: user.id
        })
        .select()
        .single();

      result = data;
      if (error) {
        console.error('Error creating job description:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create job description' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({
        jobDescription: result,
        message: 'Job description saved successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in attach-job-description function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});