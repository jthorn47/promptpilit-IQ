import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AssignPlanRequest {
  plan_template_id: string;
  client_id: string;
  effective_date: string;
  locked_fields: string[];
  custom_settings?: Record<string, any>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const body: AssignPlanRequest = await req.json();
    const { plan_template_id, client_id, effective_date, locked_fields, custom_settings } = body;

    console.log("Assigning plan to client:", { plan_template_id, client_id, user_id: user.id });

    // Validate tenant access
    const tenantResponse = await supabaseClient.functions.invoke('validate-tenant-access', {
      body: { client_id, user_id: user.id }
    });

    if (tenantResponse.error) {
      console.error("Tenant validation failed:", tenantResponse.error);
      return new Response(
        JSON.stringify({ error: "Access denied to client" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get the plan template
    const { data: planTemplate, error: templateError } = await supabaseClient
      .from('benefit_plan_templates')
      .select(`
        *,
        benefit_carriers(name, type),
        benefit_plan_types(category, subcategory, code)
      `)
      .eq('id', plan_template_id)
      .single();

    if (templateError || !planTemplate) {
      console.error("Plan template not found:", templateError);
      return new Response(
        JSON.stringify({ error: "Plan template not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate plan template compatibility
    const validationResponse = await supabaseClient.functions.invoke('validate-plan-template', {
      body: { plan_template: planTemplate }
    });

    if (validationResponse.error) {
      console.error("Plan template validation failed:", validationResponse.error);
      return new Response(
        JSON.stringify({ error: "Plan template validation failed", details: validationResponse.error }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create plan assignment
    const { data: assignment, error: assignmentError } = await supabaseClient
      .from('benefit_plan_assignments')
      .insert({
        plan_id: plan_template_id,
        client_id,
        effective_date,
        locked_fields,
        custom_settings: custom_settings || {},
        status: 'active',
        created_by: user.id
      })
      .select()
      .single();

    if (assignmentError) {
      console.error("Failed to create plan assignment:", assignmentError);
      return new Response(
        JSON.stringify({ error: "Failed to assign plan to client", details: assignmentError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log the audit trail
    await supabaseClient.functions.invoke('log-benefits-audit', {
      body: {
        action: 'assign',
        entity_type: 'plan_assignment',
        entity_id: assignment.id,
        user_id: user.id,
        client_id,
        changes: {
          plan_template_id,
          effective_date,
          locked_fields,
          custom_settings
        }
      }
    });

    console.log("Plan assigned successfully:", assignment.id);

    return new Response(
      JSON.stringify({
        success: true,
        assignment_id: assignment.id,
        message: `Plan "${planTemplate.name}" assigned to client successfully`
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in assign-plan-to-client:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);