import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const hookSecret = Deno.env.get("SUPABASE_AUTH_WEBHOOK_SECRET") || "your-webhook-secret";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
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
    const payload = await req.text();
    const headers = Object.fromEntries(req.headers);
    
    // Verify webhook signature if secret is configured
    if (hookSecret && hookSecret !== "your-webhook-secret") {
      const wh = new Webhook(hookSecret);
      try {
        wh.verify(payload, headers);
      } catch (error) {
        console.error("Webhook signature verification failed:", error);
        return new Response("Unauthorized", { status: 401, headers: corsHeaders });
      }
    }

    const webhookData = JSON.parse(payload);
    const { user, email_data } = webhookData;

    if (!user?.email || !email_data) {
      console.error("Missing required data in webhook payload");
      return new Response("Bad Request", { status: 400, headers: corsHeaders });
    }

    // Determine email type based on the webhook data
    let emailType = 'confirmation';
    let confirmationUrl = '';
    
    if (email_data.token_hash && email_data.redirect_to) {
      confirmationUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/verify?token=${email_data.token_hash}&type=${email_data.email_action_type}&redirect_to=${email_data.redirect_to}`;
      
      if (email_data.email_action_type === 'recovery') {
        emailType = 'reset';
      }
    }

    // Send email via our auth email function
    const emailResponse = await resend.emails.send({
      from: "EaseLearn <onboarding@resend.dev>",
      to: [user.email],
      subject: emailType === 'reset' ? 'Reset your password - EaseLearn' : 'Welcome to EaseLearn! Please confirm your email',
      html: getEmailTemplate(emailType, {
        firstName: user.user_metadata?.first_name || '',
        confirmationUrl,
        resetUrl: confirmationUrl
      })
    });

    console.log("Auth email sent successfully:", {
      messageId: emailResponse.data?.id,
      email: user.email,
      type: emailType,
      timestamp: new Date().toISOString()
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
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
    console.error("Error in auth-email-webhook function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to send auth email",
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

function getEmailTemplate(type: string, data: any) {
  if (type === 'reset') {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #655DC6;">Password Reset</h1>
        <p>Hi there,</p>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.resetUrl}" 
             style="background: #655DC6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, copy and paste this link:</p>
        <p style="word-break: break-all; color: #666;">${data.resetUrl}</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>Best regards,<br>The EaseLearn Team</p>
      </div>
    `;
  }
  
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #655DC6;">Welcome to EaseLearn!</h1>
      <p>Hi ${data.firstName || 'there'},</p>
      <p>Thanks for signing up! Please confirm your email address by clicking the button below:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${data.confirmationUrl}" 
           style="background: #655DC6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Confirm Email Address
        </a>
      </div>
      <p>If the button doesn't work, copy and paste this link:</p>
      <p style="word-break: break-all; color: #666;">${data.confirmationUrl}</p>
      <p>Best regards,<br>The EaseLearn Team</p>
    </div>
  `;
}

serve(handler);