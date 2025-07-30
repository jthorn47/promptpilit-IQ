import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_ANON_KEY') ?? ''
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
    const { email, password, firstName, lastName, companyName } = await req.json();

    console.log("Enhanced signup request:", { email, firstName, lastName, companyName });

    // First, try to sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName || '',
          last_name: lastName || '',
          company_name: companyName || '',
        },
        emailRedirectTo: `${Deno.env.get('SUPABASE_URL')}/auth/v1/callback?redirect_to=${encodeURIComponent(req.headers.get('referer') || 'https://easelearn.com')}`
      }
    });

    if (error) {
      console.error("Signup error:", error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    // If signup successful but user needs confirmation, send email
    if (data.user && !data.user.email_confirmed_at) {
      const confirmationUrl = `${Deno.env.get('SUPABASE_URL')}/auth/v1/confirm?token=${data.user.email_change_token_new || 'pending'}&type=signup&redirect_to=${encodeURIComponent(req.headers.get('referer') || 'https://easelearn.com')}`;

      const emailResponse = await resend.emails.send({
        from: "EaseLearn <noreply@easeworks.com>",
        to: [email],
        subject: "Welcome to EaseLearn! Please confirm your email",
        html: getEmailTemplate({
          firstName: firstName || '',
          confirmationUrl,
          email
        })
      });

      console.log("Confirmation email sent:", {
        messageId: emailResponse.data?.id,
        email,
        timestamp: new Date().toISOString()
      });

      return new Response(
        JSON.stringify({ 
          success: true,
          message: "Account created successfully. Please check your email to confirm your account.",
          emailSent: true,
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
    }

    // If user is already confirmed or no email needed
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Account created successfully.",
        emailSent: false
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
    console.error("Error in enhanced signup:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to create account",
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

function getEmailTemplate(data: { firstName: string; confirmationUrl: string; email: string }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #655DC6; margin-bottom: 10px;">Welcome to EaseLearn!</h1>
        <p style="color: #666; font-size: 16px;">Thank you for joining our learning platform</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; color: #333;">Hi ${data.firstName || 'there'},</p>
        <p style="color: #666; margin-top: 10px;">Thanks for signing up! We're excited to have you on board. To get started, please confirm your email address by clicking the button below:</p>
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
      </div>
    </div>
  `;
}

serve(handler);