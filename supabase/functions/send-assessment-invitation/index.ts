import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Brand configuration helpers
function getBrandConfig(brandIdentity: string, context?: string) {
  switch (brandIdentity) {
    case 'easeworks':
      return {
        identity: brandIdentity,
        emailDomain: 'easeworks.com',
        displayName: 'Easeworks',
        primaryColor: '#2563eb'
      };
    case 'easelearn':
      return {
        identity: brandIdentity,
        emailDomain: 'easelearn.com',
        displayName: 'EaseLearn',
        primaryColor: '#059669'
      };
    case 'dual':
      const isDualTraining = context === 'training' || context === 'lms' || context === 'learning';
      return {
        identity: brandIdentity,
        emailDomain: isDualTraining ? 'easelearn.com' : 'easeworks.com',
        displayName: 'Dual Brand',
        primaryColor: '#7c3aed'
      };
    default:
      return {
        identity: 'easeworks',
        emailDomain: 'easeworks.com',
        displayName: 'Easeworks',
        primaryColor: '#2563eb'
      };
  }
}

function getBrandLogoUrl(brandIdentity: string): string | null {
  switch (brandIdentity) {
    case 'easeworks':
      return 'https://easeworks.com/logo-light.png';
    case 'easelearn':
      return 'https://easelearn.com/logo-light.png';
    case 'dual':
      return 'https://easeworks.com/logo-dual.png';
    default:
      return null;
  }
}

function getSubjectPrefix(brandIdentity: string): string {
  switch (brandIdentity) {
    case 'easeworks':
      return '[Easeworks]';
    case 'easelearn':
      return '[EaseLearn]';
    case 'dual':
      return '[Dual Brand]';
    default:
      return '[Easeworks]';
  }
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AssessmentInvitationRequest {
  to: string;
  firstName: string;
  companyName: string;
  senderName?: string;
  brandIdentity?: string;
  context?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, firstName, companyName, senderName, brandIdentity = 'easeworks', context = 'assessment' }: AssessmentInvitationRequest = await req.json();

    const assessmentUrl = `${new URL(req.url).origin}/assessment`;
    
    // Get brand configuration
    const brandConfig = getBrandConfig(brandIdentity, context);
    const logoUrl = getBrandLogoUrl(brandIdentity);
    const subjectPrefix = getSubjectPrefix(brandIdentity);

    const emailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>HR Risk Score Assessment</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, ${brandConfig.primaryColor || '#655DC6'} 0%, #4f46e5 100%); padding: 40px 30px; text-align: center;">
              ${logoUrl ? `<img src="${logoUrl}" alt="${brandConfig.displayName}" style="height: 40px; margin-bottom: 20px;" />` : ''}
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                HR Risk Score Assessment
              </h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">
                Discover your HR compliance score in just 10 minutes
              </p>
            </div>

            <!-- Main Content -->
            <div style="padding: 40px 30px;">
              <p style="font-size: 18px; margin: 0 0 20px 0; color: #1f2937;">
                Hi ${firstName},
              </p>

              <p style="font-size: 16px; margin: 0 0 24px 0; color: #4b5563; line-height: 1.7;">
                Are you confident your HR practices are protecting ${companyName}?
              </p>

              <p style="font-size: 16px; margin: 0 0 24px 0; color: #4b5563; line-height: 1.7;">
                Take 10 minutes to complete our <strong>HR Risk Score Assessment</strong> — a quick and powerful way to uncover potential gaps in your compliance, policies, and practices.
              </p>

              <!-- Benefits List -->
              <div style="background: #f8fafc; border-radius: 8px; padding: 24px; margin: 24px 0;">
                <h3 style="color: #1f2937; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
                  You'll get:
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                  <li style="margin-bottom: 8px;">A personalized risk score based on your answers</li>
                  <li style="margin-bottom: 8px;">Instant feedback on areas of concern</li>
                  <li style="margin-bottom: 8px;">Practical recommendations to improve your HR health</li>
                  <li style="margin-bottom: 0;">An optional side-by-side labor cost comparison if you're outsourcing HR or considering it</li>
                </ul>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 32px 0;">
                <a href="${assessmentUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, ${brandConfig.primaryColor || '#655DC6'} 0%, #4f46e5 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; letter-spacing: -0.3px; box-shadow: 0 4px 14px rgba(101, 93, 198, 0.4); transition: all 0.2s;">
                  👉 Take the Assessment Now
                </a>
              </div>

              <p style="font-size: 16px; margin: 24px 0; color: #4b5563; line-height: 1.7;">
                This free tool was built for California employers — especially those navigating complex labor laws, SB 553, and rising PAGA claim risks. Whether you handle HR in-house or through a provider like ADP, Paychex, or HRMobile, this will give you a clear, unbiased picture.
              </p>

              <p style="font-size: 16px; margin: 24px 0 0 0; color: #4b5563; line-height: 1.7;">
                Need help reviewing the results? Just reply and we'll walk through it with you.
              </p>

              ${senderName ? `
              <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                <p style="font-size: 16px; margin: 0; color: #4b5563;">
                  Best regards,<br>
                  <strong>${senderName}</strong>
                </p>
              </div>
              ` : ''}
            </div>

            <!-- Footer -->
            <div style="background: #f8fafc; padding: 24px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                This assessment takes approximately 10 minutes to complete and provides immediate insights into your HR risk profile.
              </p>
            </div>
          </div>

          <!-- Mobile Optimization -->
          <style>
            @media only screen and (max-width: 600px) {
              body { padding: 20px 10px !important; }
              .container { padding: 20px !important; }
              h1 { font-size: 24px !important; }
              .cta-button { padding: 14px 24px !important; font-size: 15px !important; }
            }
          </style>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: `${brandConfig.displayName} <noreply@${brandConfig.emailDomain}>`,
      to: [to],
      subject: `${subjectPrefix} How compliant is your HR program? Find out in 10 minutes.`,
      html: emailHTML,
    });

    console.log("Assessment invitation email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      messageId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-assessment-invitation function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);