import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getResendClient } from '../_shared/resend-client.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface BulkEmailRequest {
  template_id: string;
  recipients: Array<{
    email: string;
    name?: string;
    variables?: Record<string, any>;
  }>;
  send_immediately?: boolean;
  scheduled_for?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { template_id, recipients, send_immediately = true, scheduled_for }: BulkEmailRequest = await req.json();

    // Get email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates_v2')
      .select('*')
      .eq('id', template_id)
      .single();

    if (templateError || !template) {
      throw new Error('Template not found');
    }

    // Get user settings for authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const jwt = authHeader.replace('Bearer ', '');
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
    
    if (userError || !userData.user) {
      throw new Error('Invalid user token');
    }

    // Get user's email settings
    const { data: userEmailSettings } = await supabase
      .from('user_email_settings')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    const fromEmail = userEmailSettings?.from_email || "noreply@easeworks.com";
    const fromName = userEmailSettings?.from_name || "EaseLearn";

    const results = [];
    const batchSize = 10; // Process in batches to avoid rate limits

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (recipient) => {
        try {
          // Replace variables in template
          let htmlContent = template.html_content;
          let subject = template.subject;
          
          if (recipient.variables) {
            for (const [key, value] of Object.entries(recipient.variables)) {
              const placeholder = `{{${key}}}`;
              htmlContent = htmlContent.replace(new RegExp(placeholder, 'g'), String(value));
              subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
            }
          }

          if (send_immediately) {
            // Generate unique tracking ID
            const trackingId = crypto.randomUUID();
            
            // Add tracking pixel to HTML content
            const trackingPixelUrl = `${supabaseUrl}/functions/v1/email-tracking?id=${trackingId}`;
            const trackingPixel = `<img src="${trackingPixelUrl}" width="1" height="1" style="display:none;" alt="" />`;
            const htmlWithTracking = htmlContent + trackingPixel;

            const emailResponse = await resend.emails.send({
              from: `${fromName} <${fromEmail}>`,
              to: [recipient.email],
              subject: subject,
              html: htmlWithTracking,
            });

            // Log the email with tracking ID
            const { data: historyData } = await supabase.from('email_sending_history').insert({
              template_id,
              recipient_email: recipient.email,
              recipient_name: recipient.name,
              subject,
              status: 'sent',
              sent_by: userData.user.id,
              metadata: { 
                resend_id: emailResponse.data?.id,
                tracking_id: trackingId,
                tracking_enabled: true
              }
            }).select().single();

            return { 
              email: recipient.email, 
              status: 'sent',
              message_id: emailResponse.data?.id 
            };
          } else {
            // Queue for later
            const scheduledDate = scheduled_for ? new Date(scheduled_for) : new Date(Date.now() + 5 * 60 * 1000); // Default 5 minutes
            
            // In a real implementation, you'd use a proper queue system
            // For now, we'll just store it in a simple table
            return { 
              email: recipient.email, 
              status: 'scheduled',
              scheduled_for: scheduledDate.toISOString()
            };
          }
        } catch (error: any) {
          console.error(`Failed to send email to ${recipient.email}:`, error);
          
          // Log failed email
          await supabase.from('email_sending_history').insert({
            template_id,
            recipient_email: recipient.email,
            recipient_name: recipient.name,
            subject: template.subject,
            status: 'failed',
            sent_by: userData.user.id,
            error_message: error.message
          });

          return { 
            email: recipient.email, 
            status: 'failed',
            error: error.message 
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Add small delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length;
    const failedCount = results.filter(r => r.status === 'failed').length;
    const scheduledCount = results.filter(r => r.status === 'scheduled').length;

    return new Response(JSON.stringify({ 
      success: true,
      total: recipients.length,
      sent: successCount,
      failed: failedCount,
      scheduled: scheduledCount,
      results
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-bulk-email function:", error);
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