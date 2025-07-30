import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidateTenantAccessRequest {
  client_id?: string;
  user_id: string;
  required_permission?: string;
  resource_type?: string;
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

    const body: ValidateTenantAccessRequest = await req.json();
    const { client_id, user_id, required_permission, resource_type } = body;

    console.log("Validating tenant access:", { client_id, user_id, required_permission });

    // Verify the requesting user matches the user_id in the request
    if (user.id !== user_id) {
      console.warn("User ID mismatch in tenant validation");
      return new Response(
        JSON.stringify({ error: "User ID mismatch" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get user roles
    const { data: userRoles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('role, company_id')
      .eq('user_id', user_id);

    if (rolesError) {
      console.error("Failed to fetch user roles:", rolesError);
      return new Response(
        JSON.stringify({ error: "Failed to validate user permissions" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user is super admin (has access to everything)
    const isSuperAdmin = userRoles?.some(role => role.role === 'super_admin');
    if (isSuperAdmin) {
      console.log("Super admin access granted");
      return new Response(
        JSON.stringify({
          access_granted: true,
          access_level: 'super_admin',
          message: "Super admin access"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // If client_id is provided, validate user has access to that client
    if (client_id) {
      // Check if user is company admin for this client
      const isCompanyAdmin = userRoles?.some(role => 
        role.role === 'company_admin' && role.company_id === client_id
      );

      if (!isCompanyAdmin) {
        // Check if user is an employee of this company
        const { data: employee, error: employeeError } = await supabaseClient
          .from('employees')
          .select('id, company_id')
          .eq('user_id', user_id)
          .eq('company_id', client_id)
          .single();

        if (employeeError || !employee) {
          console.warn("User does not have access to client:", { user_id, client_id });
          return new Response(
            JSON.stringify({ 
              error: "Access denied",
              message: "User does not have access to the specified client"
            }),
            { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }

        // Employee access - limited permissions
        return new Response(
          JSON.stringify({
            access_granted: true,
            access_level: 'employee',
            client_id: client_id,
            message: "Employee access to company resources"
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
      }

      // Company admin access
      return new Response(
        JSON.stringify({
          access_granted: true,
          access_level: 'company_admin',
          client_id: client_id,
          message: "Company admin access"
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // If no specific client_id, check if user has any valid role
    if (!userRoles || userRoles.length === 0) {
      console.warn("User has no assigned roles:", user_id);
      return new Response(
        JSON.stringify({ 
          error: "No permissions",
          message: "User has no assigned roles"
        }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // General access validation based on role
    const accessLevel = userRoles.some(role => role.role === 'company_admin') ? 'company_admin' : 'employee';

    return new Response(
      JSON.stringify({
        access_granted: true,
        access_level: accessLevel,
        available_companies: userRoles.map(role => role.company_id).filter(Boolean),
        message: "General access granted"
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in validate-tenant-access:", error);
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