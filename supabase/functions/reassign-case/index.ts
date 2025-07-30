import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReassignCaseRequest {
  caseId: string;
  assigneeId: string;
  note?: string;
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

    const { caseId, assigneeId, note }: ReassignCaseRequest = await req.json();

    if (!caseId) {
      return new Response(
        JSON.stringify({ error: 'Case ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!assigneeId) {
      return new Response(
        JSON.stringify({ error: 'Assignee ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch the existing case to check permissions and get current assignee
    const { data: existingCase, error: fetchError } = await supabaseClient
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return new Response(
          JSON.stringify({ error: 'Case not found' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      
      console.error('Error fetching case:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch case' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check permissions - user should be able to reassign case if:
    // 1. They are currently assigned to it
    // 2. They created it
    // 3. They have admin role
    const canReassign = 
      existingCase.assigned_to === user.id ||
      existingCase.created_by === user.id ||
      // Add admin check here if needed
      true; // For now, allow all authenticated users

    if (!canReassign) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate the new assignee exists (optional - could be an email or external ID)
    // For now, we'll accept any string as assigneeId
    
    // Update the case assignment
    const { data: updatedCase, error: updateError } = await supabaseClient
      .from('cases')
      .update({
        assigned_to: assigneeId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', caseId)
      .select()
      .single();

    if (updateError) {
      console.error('Error reassigning case:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to reassign case' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create activity record for the reassignment
    const activityContent = note 
      ? `Case reassigned from ${existingCase.assigned_to || 'unassigned'} to ${assigneeId}. Note: ${note}`
      : `Case reassigned from ${existingCase.assigned_to || 'unassigned'} to ${assigneeId}`;

    const { data: activity, error: activityError } = await supabaseClient
      .from('case_activities')
      .insert([
        {
          case_id: caseId,
          activity_type: 'assignment_change',
          content: activityContent,
          metadata: {
            type: 'system',
            old_assignee: existingCase.assigned_to,
            new_assignee: assigneeId,
            reassigned_by: user.id,
            note: note,
          },
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (activityError) {
      console.error('Error creating activity record:', activityError);
      // Don't fail the whole operation for this
    }

    console.log(`Case ${caseId} reassigned from ${existingCase.assigned_to} to ${assigneeId} by user ${user.id}`);

    return new Response(
      JSON.stringify({
        case: updatedCase,
        activity: activity,
        success: true,
        message: 'Case reassigned successfully',
        previous_assignee: existingCase.assigned_to,
        new_assignee: assigneeId,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in reassign-case function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});