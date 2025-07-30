import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ValidatePlanTemplateRequest {
  plan_template: {
    id?: string;
    name: string;
    carrier_id: string;
    plan_type_code: string;
    rating_method: string;
    tier_structure: string[];
    eligibility_rule_id?: string;
  };
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

    const body: ValidatePlanTemplateRequest = await req.json();
    const { plan_template } = body;

    console.log("Validating plan template:", plan_template.name);

    const validationErrors: string[] = [];

    // Validate carrier exists
    const { data: carrier, error: carrierError } = await supabaseClient
      .from('benefit_carriers')
      .select('id, name, type')
      .eq('id', plan_template.carrier_id)
      .single();

    if (carrierError || !carrier) {
      validationErrors.push(`Carrier with ID ${plan_template.carrier_id} does not exist`);
    }

    // Validate plan type exists
    const { data: planType, error: planTypeError } = await supabaseClient
      .from('benefit_plan_types')
      .select('code, category, subcategory')
      .eq('code', plan_template.plan_type_code)
      .single();

    if (planTypeError || !planType) {
      validationErrors.push(`Plan type with code ${plan_template.plan_type_code} does not exist`);
    }

    // Validate eligibility rule if provided
    if (plan_template.eligibility_rule_id) {
      const { data: eligibilityRule, error: eligibilityError } = await supabaseClient
        .from('benefit_eligibility_rules')
        .select('id, name')
        .eq('id', plan_template.eligibility_rule_id)
        .single();

      if (eligibilityError || !eligibilityRule) {
        validationErrors.push(`Eligibility rule with ID ${plan_template.eligibility_rule_id} does not exist`);
      }
    }

    // Validate rating method compatibility
    const validRatingMethods = ['composite', 'age_banded', 'custom'];
    if (!validRatingMethods.includes(plan_template.rating_method)) {
      validationErrors.push(`Invalid rating method: ${plan_template.rating_method}. Must be one of: ${validRatingMethods.join(', ')}`);
    }

    // Validate tier structure
    if (!plan_template.tier_structure || plan_template.tier_structure.length === 0) {
      validationErrors.push('Tier structure cannot be empty');
    }

    const validTiers = ['Employee', 'Employee + Spouse', 'Employee + Child(ren)', 'Employee + Family'];
    const invalidTiers = plan_template.tier_structure.filter(tier => !validTiers.includes(tier));
    if (invalidTiers.length > 0) {
      validationErrors.push(`Invalid tier(s): ${invalidTiers.join(', ')}. Valid tiers: ${validTiers.join(', ')}`);
    }

    // Business rule validations
    if (carrier && planType) {
      // Example: Medical plans cannot use composite rating for certain carriers
      if (planType.category === 'Medical' && plan_template.rating_method === 'composite' && carrier.type === 'small_group') {
        validationErrors.push('Composite rating is not available for small group medical plans');
      }

      // Example: Dental plans must have specific tier structures
      if (planType.category === 'Dental' && !plan_template.tier_structure.includes('Employee')) {
        validationErrors.push('Dental plans must include Employee tier');
      }
    }

    if (validationErrors.length > 0) {
      console.log("Validation failed:", validationErrors);
      return new Response(
        JSON.stringify({
          valid: false,
          errors: validationErrors
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Plan template validation successful");

    return new Response(
      JSON.stringify({
        valid: true,
        message: "Plan template is valid",
        validated_against: {
          carrier: carrier?.name,
          plan_type: planType?.category + ' - ' + planType?.subcategory
        }
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error) {
    console.error("Error in validate-plan-template:", error);
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