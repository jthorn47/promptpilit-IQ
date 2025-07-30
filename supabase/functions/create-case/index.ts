import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateCaseRequest {
  case: {
    title: string;
    description: string;
    type: string;
    priority: string;
    status?: string;
    source: string;
    visibility: string;
    client_viewable: boolean;
    tags: string[];
    estimated_hours?: number;
    assigned_to?: string;
    assigned_team?: string;
    related_company_id?: string;
    related_contact_email?: string;
    external_reference?: string;
    client_id?: string;
    related_employees?: string[];
  };
}

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

    const { case: caseData }: CreateCaseRequest = await req.json();

    // Validate required fields
    if (!caseData.title?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Case title is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!caseData.description?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Case description is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create the case record
    const { data: newCase, error: insertError } = await supabaseClient
      .from('cases')
      .insert([
        {
          title: caseData.title.trim(),
          description: caseData.description.trim(),
          type: caseData.type,
          priority: caseData.priority,
          status: caseData.status || 'open',
          source: caseData.source,
          visibility: caseData.visibility,
          client_viewable: caseData.client_viewable,
          tags: caseData.tags,
          estimated_hours: caseData.estimated_hours || 0,
          actual_hours: 0,
          assigned_to: caseData.assigned_to,
          assigned_team: caseData.assigned_team,
          related_company_id: caseData.related_company_id,
          related_contact_email: caseData.related_contact_email,
          external_reference: caseData.external_reference,
          client_id: caseData.client_id,
          related_employees: caseData.related_employees,
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating case:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create case' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create initial activity record
    const { error: activityError } = await supabaseClient
      .from('case_activities')
      .insert([
        {
          case_id: newCase.id,
          activity_type: 'note',
          content: `Case created: ${caseData.title}`,
          metadata: {
            type: 'system',
            priority: caseData.priority,
            initial_status: newCase.status,
          },
          created_by: user.id,
        },
      ]);

    if (activityError) {
      console.error('Error creating initial activity:', activityError);
      // Don't fail the whole operation for this
    }

    // Log the case creation for audit trail
    console.log(`Case created successfully: ${newCase.id} by user ${user.id}`);

    return new Response(
      JSON.stringify({
        case: newCase,
        success: true,
        message: 'Case created successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    );
  } catch (error) {
    console.error('Error in create-case function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});