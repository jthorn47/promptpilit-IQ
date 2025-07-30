import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrainingInvitationRequest {
  learnerEmail: string;
  learnerName: string;
  trainingTitle: string;
  companyName: string;
  dueDate?: string;
  priority: string;
  assignedBy?: string;
  learnerPortalUrl: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      learnerEmail,
      learnerName,
      trainingTitle,
      companyName,
      dueDate,
      priority,
      assignedBy,
      learnerPortalUrl
    }: TrainingInvitationRequest = await req.json();
    
    console.log('Sending training invitation to:', learnerEmail, 'for training:', trainingTitle);

    const priorityColor = priority === 'high' ? '#dc2626' : priority === 'low' ? '#16a34a' : '#f59e0b';
    const priorityText = priority.charAt(0).toUpperCase() + priority.slice(1);
    
    const dueDateText = dueDate ? new Date(dueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'No due date specified';

    const emailResponse = await resend.emails.send({
      from: "EaseLearn Training <onboarding@resend.dev>",
      to: [learnerEmail],
      subject: `New Training Assignment: ${trainingTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #655DC6, #8B7ED8); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">New Training Assignment</h1>
              <p style="color: #e5e7eb; margin: 10px 0 0 0; font-size: 16px;">You've been assigned a new training module</p>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              <div style="margin-bottom: 25px;">
                <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 20px;">Hello ${learnerName}!</h2>
                <p style="color: #6b7280; margin: 0; line-height: 1.6;">
                  You have been assigned a new training module by ${companyName}. 
                  Please complete this training at your earliest convenience.
                </p>
              </div>
              
              <!-- Training Details Card -->
              <div style="background: #f8fafc; border: 2px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 25px 0;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; display: flex; align-items: center;">
                  <span style="background: #655DC6; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 10px; font-size: 12px;">📚</span>
                  ${trainingTitle}
                </h3>
                
                <div style="display: grid; gap: 10px;">
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-weight: 500;">Priority:</span>
                    <span style="color: ${priorityColor}; font-weight: bold; background: ${priorityColor}20; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                      ${priorityText}
                    </span>
                  </div>
                  <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                    <span style="color: #6b7280; font-weight: 500;">Due Date:</span>
                    <span style="color: #1f2937; font-weight: 500;">${dueDateText}</span>
                  </div>
                  ${assignedBy ? `
                  <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                    <span style="color: #6b7280; font-weight: 500;">Assigned By:</span>
                    <span style="color: #1f2937; font-weight: 500;">${assignedBy}</span>
                  </div>
                  ` : ''}
                </div>
              </div>
              
              <!-- CTA Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${learnerPortalUrl}" 
                   style="background: linear-gradient(135deg, #655DC6, #8B7ED8); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(101, 93, 198, 0.3); transition: all 0.2s;">
                  Start Training Now
                </a>
              </div>
              
              <!-- Instructions -->
              <div style="background: #fef3c7; border: 1px solid #fbbf24; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <h4 style="color: #92400e; margin: 0 0 8px 0; font-size: 14px; font-weight: bold;">📋 Instructions:</h4>
                <ul style="color: #92400e; margin: 0; padding-left: 20px; font-size: 14px; line-height: 1.5;">
                  <li>Click the "Start Training Now" button above to access your training portal</li>
                  <li>Complete all modules and assessments</li>
                  <li>Track your progress in real-time</li>
                  <li>Contact your administrator if you need assistance</li>
                </ul>
              </div>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8fafc; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #6b7280; margin: 0; font-size: 14px;">
                This training assignment was sent by <strong>${companyName}</strong> via EaseLearn Training Platform
              </p>
              <p style="color: #9ca3af; margin: 8px 0 0 0; font-size: 12px;">
                If you have any questions about this training, please contact your administrator.
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log('Training invitation email sent successfully:', emailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      emailId: emailResponse.data?.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-training-invitation function:', error);
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