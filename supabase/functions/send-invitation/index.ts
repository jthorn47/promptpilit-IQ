import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequest {
  companyName: string;
  contactEmail: string;
  contactName: string;
  industry?: string;
  companySize?: string;
  customMessage?: string;
  assessmentUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      companyName,
      contactEmail,
      contactName,
      industry,
      companySize,
      customMessage,
      assessmentUrl
    }: InvitationRequest = await req.json();
    
    console.log('Sending invitation to:', contactEmail, 'for company:', companyName);

    // Use custom message if provided, otherwise use default
    const emailContent = customMessage || `
Dear ${contactName},

We hope this message finds you well. At Easeworks, we specialize in helping companies like ${companyName} optimize their HR practices and reduce compliance risks.

We would like to invite you to complete our 10 Minute HR Risk Assessment. This assessment will help you:

• Identify potential HR compliance gaps
• Understand your current risk level
• Receive personalized recommendations
• Get a detailed AI-generated report with actionable insights

The assessment takes approximately 10 minutes to complete and covers key areas including:
- Employment Law Compliance
- Safety & Workers Compensation  
- Training & Development
- Documentation Systems
- Performance Management

Upon completion, you'll receive a detailed report that can serve as a roadmap for improving your HR practices and reducing business risks.

Best regards,
The Easeworks Team
    `;

    const emailResponse = await resend.emails.send({
      from: "Easeworks <noreply@easeworks.com>",
      to: [contactEmail],
      subject: `10 Minute HR Risk Assessment Invitation for ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2563eb; margin: 0;">Easeworks</h1>
            <p style="color: #6b7280; margin: 5px 0;">10 Minute HR Risk Assessment Invitation</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-top: 0;">Company Details:</h2>
            <p><strong>Company:</strong> ${companyName}</p>
            ${industry ? `<p><strong>Industry:</strong> ${industry}</p>` : ''}
            ${companySize ? `<p><strong>Size:</strong> ${companySize}</p>` : ''}
          </div>
          
          <div style="white-space: pre-line; line-height: 1.6; color: #374151; margin-bottom: 30px;">
            ${emailContent}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${assessmentUrl}" 
               style="background: #2563eb; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Start 10 Minute HR Risk Assessment
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
            <p>This assessment is provided by Easeworks - Your HR Business Consulting Partner</p>
            <p>If you have any questions, please contact us at info@easeworks.com</p>
          </div>
        </div>
      `,
    });

    console.log('Invitation email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      emailId: emailResponse.data?.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-invitation function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});