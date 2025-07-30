import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UpdateCaseRequest {
  caseId: string;
  updates: {
    title?: string;
    description?: string;
    type?: string;
    priority?: string;
    status?: string;
    assigned_to?: string;
    assigned_team?: string;
    tags?: string[];
    estimated_hours?: number;
    actual_hours?: number;
    visibility?: string;
    client_viewable?: boolean;
    internal_notes?: string;
    external_reference?: string;
    related_contact_email?: string;
    closed_at?: string | null;
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

    const { caseId, updates }: UpdateCaseRequest = await req.json();

    if (!caseId) {
      return new Response(
        JSON.stringify({ error: 'Case ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Fetch the existing case to check permissions and get current state
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

    // Check permissions - user should be able to update case if:
    // 1. They are assigned to it
    // 2. They created it
    // 3. They have admin role
    const canUpdate = 
      existingCase.assigned_to === user.id ||
      existingCase.created_by === user.id ||
      // Add admin check here if needed
      true; // For now, allow all authenticated users

    if (!canUpdate) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Prepare the update data
    const updateData = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    // Update the case
    const { data: updatedCase, error: updateError } = await supabaseClient
      .from('cases')
      .update(updateData)
      .eq('id', caseId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating case:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update case' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Track significant changes and create activity records
    const significantChanges = [];
    
    if (updates.status && updates.status !== existingCase.status) {
      significantChanges.push({
        case_id: caseId,
        activity_type: 'status_change',
        content: `Status changed from ${existingCase.status} to ${updates.status}`,
        metadata: {
          type: 'system',
          old_value: existingCase.status,
          new_value: updates.status,
        },
        created_by: user.id,
      });
    }

    if (updates.assigned_to && updates.assigned_to !== existingCase.assigned_to) {
      significantChanges.push({
        case_id: caseId,
        activity_type: 'assignment_change',
        content: `Case reassigned from ${existingCase.assigned_to || 'unassigned'} to ${updates.assigned_to}`,
        metadata: {
          type: 'system',
          old_value: existingCase.assigned_to,
          new_value: updates.assigned_to,
        },
        created_by: user.id,
      });
    }

    if (updates.priority && updates.priority !== existingCase.priority) {
      significantChanges.push({
        case_id: caseId,
        activity_type: 'note',
        content: `Priority changed from ${existingCase.priority} to ${updates.priority}`,
        metadata: {
          type: 'system',
          old_value: existingCase.priority,
          new_value: updates.priority,
        },
        created_by: user.id,
      });
    }

    // Insert activity records for significant changes
    if (significantChanges.length > 0) {
      const { error: activityError } = await supabaseClient
        .from('case_activities')
        .insert(significantChanges);

      if (activityError) {
        console.error('Error creating activity records:', activityError);
        // Don't fail the whole operation for this
      }
    }

    console.log(`Case updated successfully: ${caseId} by user ${user.id}`);

    return new Response(
      JSON.stringify({
        case: updatedCase,
        changes: Object.keys(updates),
        activities: significantChanges.length,
        success: true,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in update-case function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});