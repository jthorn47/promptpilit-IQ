import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateStatusRequest {
  caseId: string;
  status: 'open' | 'in_progress' | 'waiting' | 'closed';
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

    const { caseId, status, note }: UpdateStatusRequest = await req.json();

    if (!caseId) {
      return new Response(
        JSON.stringify({ error: 'Case ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!status) {
      return new Response(
        JSON.stringify({ error: 'Status is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate status
    const validStatuses = ['open', 'in_progress', 'waiting', 'closed'];
    if (!validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ error: 'Invalid status value' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch the existing case to check permissions and get current status
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

    // Check permissions - user should be able to update status if:
    // 1. They are assigned to the case
    // 2. They created the case
    // 3. They have admin role
    const canUpdateStatus = 
      existingCase.assigned_to === user.id ||
      existingCase.created_by === user.id ||
      // Add admin check here if needed
      true; // For now, allow all authenticated users

    if (!canUpdateStatus) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Don't update if status is the same
    if (existingCase.status === status) {
      return new Response(
        JSON.stringify({ 
          case: existingCase,
          message: 'Status is already set to this value',
          no_change: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare update data
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // If closing the case, set closed_at timestamp
    if (status === 'closed' && existingCase.status !== 'closed') {
      updateData.closed_at = new Date().toISOString();
    }

    // If reopening a closed case, clear closed_at
    if (status !== 'closed' && existingCase.status === 'closed') {
      updateData.closed_at = null;
    }

    // Update the case status
    const { data: updatedCase, error: updateError } = await supabaseClient
      .from('cases')
      .update(updateData)
      .eq('id', caseId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating case status:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update case status' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create activity record for status change
    const activityContent = note 
      ? `Status changed from ${existingCase.status} to ${status}. Note: ${note}`
      : `Status changed from ${existingCase.status} to ${status}`;

    const { data: activity, error: activityError } = await supabaseClient
      .from('case_activities')
      .insert([
        {
          case_id: caseId,
          activity_type: 'status_change',
          content: activityContent,
          metadata: {
            type: 'system',
            old_status: existingCase.status,
            new_status: status,
            changed_by: user.id,
            note: note,
            closed_at: status === 'closed' ? updateData.closed_at : null,
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

    console.log(`Case ${caseId} status changed from ${existingCase.status} to ${status} by user ${user.id}`);

    return new Response(
      JSON.stringify({
        case: updatedCase,
        activity: activity,
        success: true,
        message: 'Case status updated successfully',
        previous_status: existingCase.status,
        new_status: status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in update-case-status function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});