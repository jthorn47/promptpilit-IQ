import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AssessmentData {
  id: string;
  company_name: string;
  company_email: string;
  company_size: string;
  industry: string;
  risk_score: number;
  risk_level: string;
  responses: any[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { assessmentId }: { assessmentId: string } = await req.json();
    
    console.log(`Processing assessment results email for ID: ${assessmentId}`);

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Fetch the assessment data
    const { data: assessment, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('id', assessmentId)
      .single();

    if (error || !assessment) {
      console.error('Error fetching assessment:', error);
      throw new Error('Assessment not found');
    }

    const assessmentData: AssessmentData = assessment;

    // Generate risk level styling
    const getRiskStyling = (riskLevel: string) => {
      switch (riskLevel) {
        case 'Low Risk':
          return { color: '#22c55e', bgColor: '#dcfce7' };
        case 'Moderate Risk':
          return { color: '#f59e0b', bgColor: '#fef3c7' };
        case 'High Risk':
          return { color: '#ef4444', bgColor: '#fee2e2' };
        default:
          return { color: '#6b7280', bgColor: '#f3f4f6' };
      }
    };

    const riskStyling = getRiskStyling(assessmentData.risk_level);

    // Create email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your HR Risk Assessment Results</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f7fafc; }
            .container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #655DC6, #8B5FE6); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .header p { margin: 10px 0 0; opacity: 0.9; }
            .content { padding: 40px 30px; }
            .score-card { background: ${riskStyling.bgColor}; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
            .score { font-size: 48px; font-weight: bold; color: ${riskStyling.color}; margin: 0; }
            .risk-level { color: ${riskStyling.color}; font-weight: 600; font-size: 18px; margin: 10px 0; }
            .company-info { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 25px 0; }
            .next-steps { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 25px 0; }
            .cta-button { display: inline-block; background: #655DC6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 10px; }
            .footer { background: #f8fafc; padding: 30px; text-align: center; color: #6b7280; font-size: 14px; }
            .footer a { color: #655DC6; text-decoration: none; }
            ul { padding-left: 20px; }
            li { margin: 8px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <h1>🎯 Your HR Risk Assessment Results</h1>
              <p>Comprehensive analysis for ${assessmentData.company_name}</p>
            </div>

            <!-- Main Content -->
            <div class="content">
              <p>Hello ${assessmentData.company_name} team,</p>
              
              <p>Thank you for completing our comprehensive HR Risk Assessment. Below are your detailed results and personalized recommendations.</p>

              <!-- Score Card -->
              <div class="score-card">
                <div class="score">${assessmentData.risk_score}%</div>
                <div class="risk-level">${assessmentData.risk_level}</div>
                <p style="margin: 15px 0 5px; color: #6b7280;">Overall HR Compliance Score</p>
              </div>

              <!-- Company Information -->
              <div class="company-info">
                <h3 style="margin-top: 0; color: #374151;">Assessment Details</h3>
                <p><strong>Company:</strong> ${assessmentData.company_name}</p>
                <p><strong>Industry:</strong> ${assessmentData.industry}</p>
                <p><strong>Company Size:</strong> ${assessmentData.company_size}</p>
                <p><strong>Assessment Date:</strong> ${new Date().toLocaleDateString()}</p>
              </div>

              <!-- Risk Analysis -->
              <h3 style="color: #374151;">What This Means for Your Business</h3>
              ${assessmentData.risk_score < 50 ? `
                <p>⚠️ <strong>Immediate Action Required:</strong> Your assessment indicates significant HR compliance gaps that could expose your business to legal risks, penalties, and operational disruptions.</p>
                <div class="next-steps">
                  <h4 style="margin-top: 0;">Priority Actions:</h4>
                  <ul>
                    <li>Schedule an urgent HR compliance review</li>
                    <li>Implement documented policies and procedures</li>
                    <li>Establish compliant employee onboarding processes</li>
                    <li>Review wage and hour practices immediately</li>
                  </ul>
                </div>
              ` : assessmentData.risk_score < 80 ? `
                <p>📈 <strong>Good Foundation, Room for Improvement:</strong> You have solid HR practices in place, but there are strategic opportunities to strengthen your compliance posture.</p>
                <div class="next-steps">
                  <h4 style="margin-top: 0;">Recommended Next Steps:</h4>
                  <ul>
                    <li>Fine-tune existing policies and procedures</li>
                    <li>Enhance employee training programs</li>
                    <li>Implement advanced compliance monitoring</li>
                    <li>Consider preventive legal review</li>
                  </ul>
                </div>
              ` : `
                <p>✅ <strong>Excellent Compliance Foundation:</strong> Your organization demonstrates strong HR practices. Focus on maintaining these standards and staying ahead of evolving regulations.</p>
                <div class="next-steps">
                  <h4 style="margin-top: 0;">Optimization Opportunities:</h4>
                  <ul>
                    <li>Implement advanced HR analytics</li>
                    <li>Stay current with emerging compliance requirements</li>
                    <li>Consider industry-specific best practices</li>
                    <li>Explore strategic HR technology upgrades</li>
                  </ul>
                </div>
              `}

              <!-- Call to Action -->
              <div style="text-align: center; margin: 40px 0;">
                <h3 style="color: #374151;">Ready to Improve Your HR Risk Profile?</h3>
                <p>Our HR experts are standing by to help you address these findings and protect your business.</p>
                
                <a href="https://meetings.hubspot.com/jeffrey-thorn?uuid=9addbf01-5b8f-4a1f-ac02-50e96bf8653b" class="cta-button">
                  📅 Schedule Free Consultation
                </a>
                
                <a href="https://easeworks.com/labor-cost-calculator" class="cta-button" style="background: #0ea5e9;">
                  📊 Calculate Labor Savings
                </a>
              </div>

              <p><strong>Questions about your results?</strong> Reply to this email or call us at <a href="tel:+1-555-EASEWORK">(555) EASE-WORK</a>. Our team is here to help you turn these insights into action.</p>
            </div>

            <!-- Footer -->
            <div class="footer">
              <p><strong>Easeworks</strong> - Your Trusted HR Compliance Partner</p>
              <p>
                <a href="https://easeworks.com">Website</a> | 
                <a href="mailto:support@easeworks.com">Support</a> | 
                <a href="https://easeworks.com/privacy">Privacy Policy</a>
              </p>
              <p>© ${new Date().getFullYear()} Easeworks. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send the email
    const emailResponse = await resend.emails.send({
      from: "Easeworks HR Assessment <assessments@easeworks.com>",
      to: [assessmentData.company_email],
      subject: `🎯 Your HR Risk Assessment Results - ${assessmentData.risk_score}% Score`,
      html: emailHtml,
    });

    console.log("Assessment results email sent successfully:", emailResponse);

    // Update the assessment to mark email as sent
    await supabase
      .from('assessments')
      .update({ 
        reminder_sent_at: new Date().toISOString(),
        completion_metadata: {
          ...assessmentData.completion_metadata,
          email_sent: true,
          email_sent_at: new Date().toISOString()
        }
      })
      .eq('id', assessmentId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailId: emailResponse.data?.id,
        message: "Assessment results email sent successfully" 
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
    console.error("Error in send-assessment-results function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
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