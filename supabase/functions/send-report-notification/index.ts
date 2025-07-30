import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  reportId: string;
  prompt: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, reportId, prompt }: EmailRequest = await req.json();

    console.log('📧 Sending report notification email to:', to);

    const emailResponse = await resend.emails.send({
      from: "HaaLO IQ <notifications@resend.dev>",
      to: [to],
      subject: "Your AI Report is Ready! 📊",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Your Report is Ready!</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
            <h2 style="color: #333; margin-top: 0;">Report Generated Successfully</h2>
            <p style="color: #666; line-height: 1.6;">
              Great news! Your AI-powered report has been generated and is ready for review.
            </p>
            
            <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #667eea; margin: 20px 0;">
              <strong style="color: #333;">Your Request:</strong>
              <p style="margin: 10px 0 0 0; color: #666; font-style: italic;">"${prompt}"</p>
            </div>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'app.lovable.dev')}/admin/halo/iq" 
               style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px;">
              View Your Report
            </a>
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center; color: #999; font-size: 14px;">
            <p>This email was sent by HaaLO IQ - Your AI-powered business intelligence assistant</p>
            <p>Report ID: ${reportId}</p>
          </div>
        </div>
      `,
    });

    console.log("✅ Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("❌ Error in send-report-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);