import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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
    const { email } = await req.json();

    console.log("Sending manual confirmation email to:", email);

    // Generate a confirmation URL (simplified for manual confirmation)
    const confirmationUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/confirm?token=manual-confirm&type=email&redirect_to=${encodeURIComponent('https://easelearn.com/auth')}`;

    const emailResponse = await resend.emails.send({
      from: "EaseLearn <noreply@easeworks.com>",
      to: [email],
      subject: "Confirm your EaseLearn account",
      html: getManualConfirmationTemplate({
        confirmationUrl,
        email
      })
    });

    console.log("Manual confirmation email sent:", {
      messageId: emailResponse.data?.id,
      email,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Manual confirmation email sent successfully",
        messageId: emailResponse.data?.id
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
    console.error("Error sending manual confirmation:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to send manual confirmation email",
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

function getManualConfirmationTemplate(data: { confirmationUrl: string; email: string }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #655DC6; margin-bottom: 10px;">Confirm Your EaseLearn Account</h1>
        <p style="color: #666; font-size: 16px;">Your account is ready - just confirm your email</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; color: #333;">Hello,</p>
        <p style="color: #666; margin-top: 10px;">Your EaseLearn account has been created. Please confirm your email address to complete the setup:</p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.confirmationUrl}" 
           style="background: #655DC6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
          Confirm Email Address
        </a>
      </div>
      
      <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px;">
        <p style="color: #666; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666; font-size: 14px; background: #f8f9fa; padding: 10px; border-radius: 4px;">${data.confirmationUrl}</p>
      </div>
      
      <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #666; font-size: 14px;">Best regards,<br>The EaseLearn Team</p>
        <p style="color: #999; font-size: 12px; margin-top: 10px;">Account: ${data.email}</p>
      </div>
    </div>
  `;
}

serve(handler);