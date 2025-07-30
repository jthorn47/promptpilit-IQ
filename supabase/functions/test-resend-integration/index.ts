import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";
import { getResendClient } from '../_shared/resend-client.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  integration_id: string;
  test_email?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("🧪 Testing Resend integration...");
    
    const { integration_id, test_email }: TestEmailRequest = await req.json();
    
    if (!integration_id) {
      throw new Error("Integration ID is required");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the integration details from database
    console.log("📖 Fetching integration details for ID:", integration_id);
    const { data: integration, error: fetchError } = await supabase
      .from('integrations')
      .select('*')
      .eq('id', integration_id)
      .single();

    if (fetchError) {
      console.error("❌ Error fetching integration:", fetchError);
      throw new Error(`Failed to fetch integration: ${fetchError.message}`);
    }

    if (!integration) {
      throw new Error("Integration not found");
    }

    console.log("🔑 Integration credentials:", {
      hasApiKey: !!integration.credentials?.api_key,
      fromEmail: integration.credentials?.from_email,
      fromName: integration.credentials?.from_name
    });

    // Check if we have the necessary credentials
    if (!integration.credentials?.api_key) {
      throw new Error("Resend API key not configured for this integration");
    }

    if (!integration.credentials?.from_email) {
      throw new Error("From email not configured for this integration");
    }

    // Initialize Resend with the shared client
    console.log("🔑 Using shared Resend client from integration");
    const resend = await getResendClient();

    // Determine recipient email
    const recipientEmail = test_email || integration.credentials.from_email;
    const fromName = integration.credentials.from_name || "Integration Hub";

    console.log("📧 Sending test email from:", `${fromName} <${integration.credentials.from_email}>`, "to:", recipientEmail);

    // Send test email
    const emailResponse = await resend.emails.send({
      from: `${fromName} <${integration.credentials.from_email}>`,
      to: [recipientEmail],
      subject: "✅ Resend Integration Test Successful",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #22c55e; margin-bottom: 20px;">🎉 Integration Test Successful!</h1>
          
          <p style="font-size: 16px; line-height: 1.6; color: #374151;">
            Congratulations! Your Resend integration is working perfectly.
          </p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #1f2937; margin-top: 0;">Integration Details:</h3>
            <ul style="color: #6b7280; margin: 0;">
              <li><strong>Integration ID:</strong> ${integration_id}</li>
              <li><strong>From Email:</strong> ${integration.credentials.from_email}</li>
              <li><strong>From Name:</strong> ${fromName}</li>
              <li><strong>Test Time:</strong> ${new Date().toLocaleString()}</li>
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
            This email was sent automatically by your Advanced Integration Hub to verify your Resend configuration.
          </p>
        </div>
      `,
    });

    console.log("✅ Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({
      success: true,
      message: "Test email sent successfully",
      email_id: emailResponse.data?.id,
      sent_to: recipientEmail,
      sent_from: `${fromName} <${integration.credentials.from_email}>`,
      integration_id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("❌ Error in test-resend-integration function:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        details: "Check the function logs for more information"
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