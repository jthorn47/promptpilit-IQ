import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GetJobTitlesQuery {
  is_global?: boolean;
  client_id?: string;
  category?: string;
  include_descriptions?: boolean;
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

    const url = new URL(req.url);
    const is_global = url.searchParams.get('is_global') === 'true';
    const client_id = url.searchParams.get('client_id');
    const category = url.searchParams.get('category');
    const include_descriptions = url.searchParams.get('include_descriptions') === 'true';

    console.log('Fetching job titles:', { is_global, client_id, category });

    // Build base query
    let selectQuery = `
      *,
      workers_comp_codes:wc_code_id(id, code, description),
      company_settings:client_id(id, company_name)
    `;

    if (include_descriptions) {
      selectQuery += `, job_descriptions(id, description, is_ai_generated, created_at)`;
    }

    let query = supabaseClient
      .from('job_titles')
      .select(selectQuery)
      .order('title_name', { ascending: true });

    // Apply filters
    if (is_global !== undefined) {
      query = query.eq('is_global', is_global);
    }

    if (client_id) {
      query = query.eq('client_id', client_id);
    }

    if (category) {
      query = query.eq('category', category);
    }

    const { data: jobTitles, error: queryError } = await query;

    if (queryError) {
      console.error('Error fetching job titles:', queryError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch job titles' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get categories for filtering
    const { data: categories, error: categoriesError } = await supabaseClient
      .from('job_titles')
      .select('category')
      .not('category', 'is', null)
      .order('category');

    const uniqueCategories = categories 
      ? [...new Set(categories.map(c => c.category).filter(Boolean))]
      : [];

    return new Response(
      JSON.stringify({
        jobTitles: jobTitles || [],
        categories: uniqueCategories,
        count: jobTitles?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in get-job-titles function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});