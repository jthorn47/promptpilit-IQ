import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LogBenefitsAuditRequest {
  action: 'create' | 'update' | 'delete' | 'assign' | 'unassign';
  entity_type: 'carrier' | 'plan_type' | 'plan_template' | 'eligibility_rule' | 'deduction_code' | 'document' | 'plan_assignment';
  entity_id: string;
  user_id: string;
  client_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  changes?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
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

    const body: LogBenefitsAuditRequest = await req.json();
    const {
      action,
      entity_type,
      entity_id,
      user_id,
      client_id,
      old_values,
      new_values,
      changes,
      ip_address,
      user_agent
    } = body;

    console.log("Logging benefits audit:", { action, entity_type, entity_id, user_id });

    // Get user email for audit trail
    let userEmail = null;
    try {
      const { data: userData, error: userError } = await supabaseClient.auth.getUser();
      if (userData.user) {
        userEmail = userData.user.email;
      }
    } catch (error) {
      console.warn("Could not fetch user email for audit:", error);
    }

    // Extract IP address from request headers if not provided
    const clientIpAddress = ip_address || 
      req.headers.get('x-forwarded-for') || 
      req.headers.get('x-real-ip') || 
      'unknown';

    // Extract user agent if not provided
    const clientUserAgent = user_agent || req.headers.get('user-agent') || 'unknown';

    // Create audit log entry
    const { data: auditLog, error: auditError } = await supabaseClient
      .from('benefit_audit_logs')
      .insert({
        entity_type,
        entity_id,
        action,
        old_values,
        new_values: new_values || changes,
        user_id,
        user_email: userEmail,
        ip_address: clientIpAddress,
        user_agent: clientUserAgent,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (auditError) {
      console.error("Failed to create audit log:", auditError);
      return new Response(
        JSON.stringify({ error: "Failed to log audit entry", details: auditError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Log additional context for specific actions
    const contextInfo: Record<string, any> = {
      timestamp: new Date().toISOString(),
      action_description: generateActionDescription(action, entity_type, changes || new_values),
      client_id
    };

    console.log("Audit log created successfully:", {
      audit_id: auditLog.id,
      context: contextInfo
    });

    return new Response(
      JSON.stringify({
        success: true,
        audit_id: auditLog.id,
        message: "Audit entry logged successfully",
        context: contextInfo
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in log-benefits-audit:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function generateActionDescription(
  action: string,
  entityType: string,
  values?: Record<string, any>
): string {
  const entityName = entityType.replace('_', ' ').toLowerCase();
  
  switch (action) {
    case 'create':
      return `Created new ${entityName}${values?.name ? ` "${values.name}"` : ''}`;
    case 'update':
      return `Updated ${entityName}${values?.name ? ` "${values.name}"` : ''}`;
    case 'delete':
      return `Deleted ${entityName}${values?.name ? ` "${values.name}"` : ''}`;
    case 'assign':
      return `Assigned ${entityName} to client${values?.client_id ? ` (${values.client_id})` : ''}`;
    case 'unassign':
      return `Unassigned ${entityName} from client${values?.client_id ? ` (${values.client_id})` : ''}`;
    default:
      return `Performed ${action} on ${entityName}`;
  }
}

serve(handler);