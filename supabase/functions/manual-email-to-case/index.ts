import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ManualCaseRequest {
  email_id: string;
  subject: string;
  from: string;
  content: string;
  case_type?: string;
  priority?: string;
  assigned_to?: string;
  company_id?: string;
  tags?: string[];
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const requestData: ManualCaseRequest = await req.json();

    // Check if email already has a case
    const { data: existingMapping } = await supabaseClient
      .from('email_case_mappings')
      .select('*')
      .eq('email_id', requestData.email_id)
      .single();

    if (existingMapping) {
      return new Response(
        JSON.stringify({ 
          error: 'Email already has an associated case',
          case_id: existingMapping.case_id 
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create case from email
    const caseData = {
      title: requestData.subject || 'Email Support Request',
      description: `Email received from: ${requestData.from}\n\nContent:\n${requestData.content}`,
      type: requestData.case_type || 'general_support',
      priority: requestData.priority || 'medium',
      status: 'open',
      source: 'email',
      visibility: 'internal',
      client_viewable: false,
      tags: ['email-generated', 'manual-creation', ...(requestData.tags || [])],
      estimated_hours: 1,
      actual_hours: 0,
      assigned_to: requestData.assigned_to,
      related_company_id: requestData.company_id,
      related_contact_email: requestData.from,
      external_reference: requestData.email_id,
      created_by: user.id
    };

    const { data: newCase, error: caseError } = await supabaseClient
      .from('cases')
      .insert([caseData])
      .select()
      .single();

    if (caseError) {
      console.error('Error creating case:', caseError);
      return new Response(
        JSON.stringify({ error: 'Failed to create case' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Create email-case mapping
    const { error: mappingError } = await supabaseClient
      .from('email_case_mappings')
      .insert({
        email_id: requestData.email_id,
        case_id: newCase.id
      });

    if (mappingError) {
      console.error('Error creating email mapping:', mappingError);
    }

    // Create initial activity
    const { error: activityError } = await supabaseClient
      .from('case_activities')
      .insert({
        case_id: newCase.id,
        activity_type: 'email',
        content: `Case manually created from email: ${requestData.subject}`,
        metadata: {
          email_id: requestData.email_id,
          email_from: requestData.from,
          created_manually: true
        },
        created_by: user.id
      });

    if (activityError) {
      console.error('Error creating initial activity:', activityError);
    }

    console.log(`Manual case created: ${newCase.id} from email ${requestData.email_id} by user ${user.id}`);

    return new Response(
      JSON.stringify({
        success: true,
        case: newCase,
        message: 'Case created successfully from email'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in manual email-to-case function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});