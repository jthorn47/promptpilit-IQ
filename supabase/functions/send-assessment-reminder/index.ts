import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AssessmentReminderRequest {
  assessmentId: string;
  assignedTo: string[];
  dueDate?: string;
  companyName: string;
  reminderType: 'initial' | 'reminder' | 'overdue';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { assessmentId, assignedTo, dueDate, companyName, reminderType }: AssessmentReminderRequest = await req.json();

    // Get user details for the assigned users
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, email')
      .in('user_id', assignedTo);

    if (profileError) {
      throw new Error(`Failed to fetch user profiles: ${profileError.message}`);
    }

    const emailPromises = profiles.map(async (profile) => {
      const subject = getSubject(reminderType, companyName);
      const htmlContent = getHtmlContent(reminderType, companyName, dueDate, assessmentId);

      // Send email
      const emailResponse = await resend.emails.send({
        from: "EaseLearn <noreply@easeworks.com>",
        to: [profile.email],
        subject,
        html: htmlContent,
      });

      // Create notification in database
      await supabase
        .from('assessment_notifications')
        .insert({
          assessment_id: assessmentId,
          user_id: profile.user_id,
          notification_type: reminderType === 'initial' ? 'assignment' : 'reminder',
          title: subject,
          message: getNotificationMessage(reminderType, companyName),
          action_url: `/assessment?id=${assessmentId}`,
          metadata: {
            reminder_type: reminderType,
            due_date: dueDate,
            email_sent: true
          }
        });

      return emailResponse;
    });

    const emailResults = await Promise.all(emailPromises);

    // Update assessment reminder timestamp
    await supabase
      .from('assessments')
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq('id', assessmentId);

    console.log("Assessment reminders sent successfully:", emailResults);

    return new Response(JSON.stringify({ 
      success: true, 
      emailsSent: emailResults.length,
      results: emailResults 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-assessment-reminder function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

function getSubject(reminderType: string, companyName: string): string {
  switch (reminderType) {
    case 'initial':
      return `🛡️ New Risk Assessment Assignment - ${companyName}`;
    case 'reminder':
      return `⏰ Reminder: Complete Your Risk Assessment - ${companyName}`;
    case 'overdue':
      return `🚨 Overdue: Risk Assessment Requires Immediate Attention - ${companyName}`;
    default:
      return `Risk Assessment - ${companyName}`;
  }
}

function getNotificationMessage(reminderType: string, companyName: string): string {
  switch (reminderType) {
    case 'initial':
      return `You have been assigned a new risk assessment for ${companyName}. Please complete it by the due date.`;
    case 'reminder':
      return `Don't forget to complete your risk assessment for ${companyName}. The due date is approaching.`;
    case 'overdue':
      return `Your risk assessment for ${companyName} is now overdue. Please complete it immediately.`;
    default:
      return `Risk assessment notification for ${companyName}`;
  }
}

function getHtmlContent(reminderType: string, companyName: string, dueDate?: string, assessmentId?: string): string {
  const urgencyColor = reminderType === 'overdue' ? '#ef4444' : reminderType === 'reminder' ? '#f59e0b' : '#10b981';
  const urgencyText = reminderType === 'overdue' ? 'OVERDUE' : reminderType === 'reminder' ? 'REMINDER' : 'NEW ASSIGNMENT';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Risk Assessment ${urgencyText}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #655DC6, #7C3AED); padding: 30px; border-radius: 10px; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; text-align: center;">🛡️ Risk Assessment ${urgencyText}</h1>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid ${urgencyColor}; margin-bottom: 30px;">
            <h2 style="color: ${urgencyColor}; margin-top: 0;">${getSubject(reminderType, companyName)}</h2>
            <p style="font-size: 16px; margin-bottom: 15px;">
                ${getDetailedMessage(reminderType, companyName, dueDate)}
            </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="${Deno.env.get('SUPABASE_URL')?.replace('//', '//xfamoteqhcavggiqndfj.')}/assessment?id=${assessmentId}" 
               style="background: #655DC6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                Complete Assessment Now
            </a>
        </div>

        <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-top: 30px;">
            <h3 style="margin-top: 0; color: #475569;">What to Expect:</h3>
            <ul style="color: #64748b;">
                <li>✅ Quick 10-15 minute assessment</li>
                <li>🏆 Earn points and achievements for completion</li>
                <li>📊 Receive detailed risk analysis report</li>
                <li>🎯 Get personalized recommendations</li>
            </ul>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 14px;">
            <p>This assessment helps ensure workplace safety and compliance.</p>
            <p>Questions? Contact your administrator or reply to this email.</p>
        </div>
    </body>
    </html>
  `;
}

function getDetailedMessage(reminderType: string, companyName: string, dueDate?: string): string {
  const dueDateText = dueDate ? ` due on ${new Date(dueDate).toLocaleDateString()}` : '';
  
  switch (reminderType) {
    case 'initial':
      return `You have been assigned a new risk assessment for <strong>${companyName}</strong>${dueDateText}. This assessment will help identify potential workplace risks and ensure compliance with safety regulations.`;
    case 'reminder':
      return `This is a friendly reminder to complete your risk assessment for <strong>${companyName}</strong>${dueDateText}. Your input is valuable for maintaining a safe workplace environment.`;
    case 'overdue':
      return `Your risk assessment for <strong>${companyName}</strong> is now overdue${dueDateText ? ` (was ${dueDateText})` : ''}. Immediate completion is required to ensure compliance and workplace safety.`;
    default:
      return `Please complete your risk assessment for ${companyName}.`;
  }
}

serve(handler);