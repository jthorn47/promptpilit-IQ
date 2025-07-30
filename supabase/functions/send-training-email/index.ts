import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  type: 'training_invitation' | 'training_reminder' | 'completion_certificate' | 'training_notification';
  to: string;
  data: {
    employeeName?: string;
    trainingTitle?: string;
    dueDate?: string;
    companyName?: string;
    certificateUrl?: string;
    loginUrl?: string;
    managerName?: string;
    [key: string]: any;
  };
}

const getEmailTemplate = (type: string, data: any) => {
  const baseStyle = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    line-height: 1.6;
    color: #333;
  `;

  switch (type) {
    case 'training_invitation':
      return {
        subject: `Training Assignment: ${data.trainingTitle}`,
        html: `
          <div style="${baseStyle}">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #655DC6;">New Training Assignment</h2>
              <p>Hello ${data.employeeName},</p>
              <p>You have been assigned a new training module: <strong>${data.trainingTitle}</strong></p>
              ${data.dueDate ? `<p><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>` : ''}
              <div style="margin: 30px 0;">
                <a href="${data.loginUrl}" style="background-color: #655DC6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Start Training
                </a>
              </div>
              <p>If you have any questions, please contact your manager.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #666;">
                This email was sent by ${data.companyName} training system.
              </p>
            </div>
          </div>
        `
      };

    case 'training_reminder':
      return {
        subject: `Reminder: ${data.trainingTitle} Due Soon`,
        html: `
          <div style="${baseStyle}">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #f59e0b;">Training Reminder</h2>
              <p>Hello ${data.employeeName},</p>
              <p>This is a reminder that your training module <strong>${data.trainingTitle}</strong> is due soon.</p>
              ${data.dueDate ? `<p><strong>Due Date:</strong> ${new Date(data.dueDate).toLocaleDateString()}</p>` : ''}
              <div style="margin: 30px 0;">
                <a href="${data.loginUrl}" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Continue Training
                </a>
              </div>
              <p>Please complete your training by the due date to maintain compliance.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #666;">
                This email was sent by ${data.companyName} training system.
              </p>
            </div>
          </div>
        `
      };

    case 'completion_certificate':
      return {
        subject: `Training Completed: ${data.trainingTitle}`,
        html: `
          <div style="${baseStyle}">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #10b981;">Congratulations!</h2>
              <p>Hello ${data.employeeName},</p>
              <p>Congratulations on successfully completing <strong>${data.trainingTitle}</strong>!</p>
              <p>Your certificate of completion has been generated and is attached to this email.</p>
              ${data.certificateUrl ? `
                <div style="margin: 30px 0;">
                  <a href="${data.certificateUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Download Certificate
                  </a>
                </div>
              ` : ''}
              <p>Keep this certificate for your records as proof of training completion.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #666;">
                This email was sent by ${data.companyName} training system.
              </p>
            </div>
          </div>
        `
      };

    case 'training_notification':
      return {
        subject: data.subject || 'Training System Notification',
        html: `
          <div style="${baseStyle}">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #655DC6;">Training Notification</h2>
              <p>Hello ${data.employeeName || 'there'},</p>
              <div style="margin: 20px 0;">
                ${data.message || 'You have a new notification from the training system.'}
              </div>
              ${data.actionUrl ? `
                <div style="margin: 30px 0;">
                  <a href="${data.actionUrl}" style="background-color: #655DC6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    ${data.actionText || 'View Details'}
                  </a>
                </div>
              ` : ''}
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="font-size: 12px; color: #666;">
                This email was sent by ${data.companyName} training system.
              </p>
            </div>
          </div>
        `
      };

    default:
      return {
        subject: 'Training System Notification',
        html: `
          <div style="${baseStyle}">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Training System</h2>
              <p>You have received a notification from the training system.</p>
            </div>
          </div>
        `
      };
  }
};

const handler = async (req: Request): Promise<Response> => {
  console.log('Send training email function called');

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, to, data }: EmailRequest = await req.json();
    
    console.log('Email request:', { type, to, dataKeys: Object.keys(data) });

    if (!type || !to) {
      throw new Error('Missing required fields: type and to');
    }

    const template = getEmailTemplate(type, data);
    
    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: `${data.companyName || 'EaseLearn'} <no-reply@easelearn.com>`,
      to: [to],
      subject: template.subject,
      html: template.html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      message: 'Email sent successfully' 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in send-training-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to send email'
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