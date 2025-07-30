import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AddNoteRequest {
  caseId: string;
  note: string;
  isInternal?: boolean;
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

    const { caseId, note, isInternal = true }: AddNoteRequest = await req.json();

    if (!caseId) {
      return new Response(
        JSON.stringify({ error: 'Case ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!note?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Note content is required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify the case exists and user has permission
    const { data: caseData, error: caseError } = await supabaseClient
      .from('cases')
      .select('id, assigned_to, created_by, client_viewable')
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

    // Check permissions - user should be able to add notes if:
    // 1. They are assigned to the case
    // 2. They created the case
    // 3. They have admin role
    const canAddNote = 
      caseData.assigned_to === user.id ||
      caseData.created_by === user.id ||
      // Add admin check here if needed
      true; // For now, allow all authenticated users

    if (!canAddNote) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create the activity record
    const { data: activity, error: insertError } = await supabaseClient
      .from('case_activities')
      .insert([
        {
          case_id: caseId,
          activity_type: 'note',
          content: note.trim(),
          metadata: {
            type: isInternal ? 'internal' : 'external',
            note_type: 'user_note',
          },
          created_by: user.id,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating note:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to add note' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Update the case's updated_at timestamp
    const { error: updateError } = await supabaseClient
      .from('cases')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', caseId);

    if (updateError) {
      console.error('Error updating case timestamp:', updateError);
      // Don't fail the whole operation for this
    }

    console.log(`Note added to case ${caseId} by user ${user.id}`);

    return new Response(
      JSON.stringify({
        activity,
        success: true,
        message: 'Note added successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      }
    );
  } catch (error) {
    console.error('Error in add-note-to-case function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});