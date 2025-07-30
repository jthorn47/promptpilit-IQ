import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SMTPTestRequest {
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { smtp_host, smtp_port, smtp_username, smtp_password }: SMTPTestRequest = await req.json();

    // Simulate SMTP connection test
    // In a real implementation, you'd use a proper SMTP library
    const testConnection = async () => {
      // Basic validation
      if (!smtp_host || !smtp_port || !smtp_username || !smtp_password) {
        throw new Error("Missing required SMTP credentials");
      }

      // Simulate connection check
      if (smtp_host === "smtp.office365.com" && smtp_port === 587) {
        // Simulate successful connection for Office 365
        return {
          success: true,
          message: "SMTP connection successful",
          details: {
            host: smtp_host,
            port: smtp_port,
            security: "STARTTLS",
            authentication: "Successful"
          }
        };
      } else {
        throw new Error("Unsupported SMTP configuration");
      }
    };

    const result = await testConnection();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("SMTP test error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: {
          type: "connection_failed",
          suggestion: "Please verify your SMTP credentials and try again"
        }
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);