import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const webhookUrl = `${supabaseUrl}/functions/v1/auth-email-webhook`;
    
    // Test webhook with sample data
    const testPayload = {
      user: {
        email: "test@example.com",
        user_metadata: {
          first_name: "Test"
        }
      },
      email_data: {
        token_hash: "test-token-hash",
        email_action_type: "signup",
        redirect_to: `${supabaseUrl}/`
      }
    };

    console.log("Testing webhook with payload:", testPayload);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testPayload)
    });

    const result = await response.text();
    console.log("Webhook response:", result);

    return new Response(
      JSON.stringify({
        success: true,
        webhookUrl,
        webhookStatus: response.status,
        webhookResponse: result,
        instructions: {
          step1: "Go to Supabase Dashboard > Authentication > Settings > Auth Hooks",
          step2: `Set the webhook URL to: ${webhookUrl}`,
          step3: "Enable for: Email confirmation and Password reset events",
          step4: "Test by creating a new user account"
        }
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );

  } catch (error: any) {
    console.error("Error testing webhook:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to test webhook",
        details: error.message 
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);