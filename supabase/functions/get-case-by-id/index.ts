import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
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
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication required' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { caseId } = await req.json();

    if (!caseId) {
      return new Response(
        JSON.stringify({ error: 'Case ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch the case with related data
    const { data: caseData, error: caseError } = await supabaseClient
      .from('cases')
      .select(`
        *,
        company_settings:related_company_id(company_name)
      `)
      .eq('id', caseId)
      .single();

    if (caseError) {
      if (caseError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Case not found' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      console.error('Error fetching case:', caseError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch case' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch case activities
    const { data: activities, error: activitiesError } = await supabaseClient
      .from('case_activities')
      .select('*')
      .eq('case_id', caseId)
      .order('created_at', { ascending: false });

    if (activitiesError) {
      console.error('Error fetching case activities:', activitiesError);
      // Don't fail the whole request, just return empty activities
    }

    // Fetch case files
    const { data: files, error: filesError } = await supabaseClient
      .from('case_files')
      .select('*')
      .eq('case_id', caseId)
      .order('uploaded_at', { ascending: false });

    if (filesError) {
      console.error('Error fetching case files:', filesError);
      // Don't fail the whole request, just return empty files
    }

    // Check permissions - user should be able to view case if:
    // 1. They are assigned to it
    // 2. They created it
    // 3. They have admin role
    // 4. It's client_viewable and they're from the same company
    const canView = 
      caseData.assigned_to === user.id ||
      caseData.created_by === user.id ||
      // Add admin check here if needed
      true; // For now, allow all authenticated users

    if (!canView) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        case: caseData,
        activities: activities || [],
        files: files || [],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in get-case-by-id function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});