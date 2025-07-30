import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface FailedSync {
  id: string;
  module_name: string;
  status: 'error' | 'stale';
  last_synced_at: string;
  error_message?: string;
  retry_count: number;
  origin_module?: string;
  target_module?: string;
  sync_duration_ms?: number;
  records_processed: number;
  created_at: string;
}

interface AlertRecipient {
  email: string;
  name?: string;
}

const DEFAULT_RECIPIENTS: AlertRecipient[] = [
  { email: 'jeffrey@easeworks.com', name: 'Jeffrey' },
  { email: 'ops@easeworks.com', name: 'Operations Team' }
];

// Get custom recipients from environment or use defaults
function getRecipients(): AlertRecipient[] {
  const customEmails = Deno.env.get('DATABRIDGE_ALERT_RECIPIENTS');
  if (customEmails) {
    return customEmails.split(',').map(email => ({ email: email.trim() }));
  }
  return DEFAULT_RECIPIENTS;
}

// Get failed and stale syncs that haven't been alerted yet
async function getUnalertedFailures(): Promise<FailedSync[]> {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  // First get failed syncs
  const { data: errorSyncs, error: errorError } = await supabase
    .from('databridge_logs')
    .select('*')
    .eq('status', 'error');

  if (errorError) throw errorError;

  // Then get stale syncs (status = stale AND last_synced_at > 15 minutes ago)
  const { data: staleSyncs, error: staleError } = await supabase
    .from('databridge_logs')
    .select('*')
    .eq('status', 'stale')
    .lt('last_synced_at', fifteenMinutesAgo);

  if (staleError) throw staleError;

  // Combine all failures
  const allFailures = [...(errorSyncs || []), ...(staleSyncs || [])];

  // Filter out already alerted ones
  const { data: alreadyAlerted, error: alertError } = await supabase
    .from('databridge_alerts')
    .select('log_id')
    .eq('status', 'sent')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  if (alertError) throw alertError;

  const alertedIds = new Set((alreadyAlerted || []).map(a => a.log_id));
  return allFailures.filter(failure => !alertedIds.has(failure.id)) as FailedSync[];
}

// Generate HTML email body for sync failure alert
function generateEmailBody(failure: FailedSync): string {
  const statusColor = failure.status === 'error' ? '#dc2626' : '#f59e0b';
  const statusText = failure.status === 'error' ? 'FAILED' : 'STALE';
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>DataBridge Sync Alert</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🚨 DataBridge Sync Alert</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">A sync operation requires attention</p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; border-top: none;">
          <div style="background: white; padding: 20px; border-radius: 6px; border-left: 4px solid ${statusColor};">
            <h2 style="margin: 0 0 15px 0; color: ${statusColor}; font-size: 20px;">
              Status: ${statusText}
            </h2>
            
            <div style="margin-bottom: 15px;">
              <strong>Module:</strong> ${failure.module_name}<br>
              <strong>Origin:</strong> ${failure.origin_module || 'Unknown'}<br>
              <strong>Target:</strong> ${failure.target_module || 'Unknown'}<br>
              <strong>Last Sync:</strong> ${new Date(failure.last_synced_at).toLocaleString()}<br>
              <strong>Retry Count:</strong> ${failure.retry_count}
            </div>
            
            ${failure.error_message ? `
              <div style="background: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 4px; margin: 15px 0;">
                <strong style="color: #dc2626;">Error Message:</strong><br>
                <code style="display: block; margin-top: 5px; font-size: 13px; word-break: break-all;">
                  ${failure.error_message}
                </code>
              </div>
            ` : ''}
            
            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
              <strong>Additional Details:</strong><br>
              Records Processed: ${failure.records_processed}<br>
              ${failure.sync_duration_ms ? `Duration: ${failure.sync_duration_ms}ms<br>` : ''}
              Created: ${new Date(failure.created_at).toLocaleString()}
            </div>
          </div>
        </div>
        
        <div style="background: #1f2937; color: white; padding: 20px; border-radius: 0 0 8px 8px; text-align: center;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">
            This alert was generated by the HaaLO DataBridge monitoring system.
          </p>
          <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.6;">
            Sync ID: ${failure.id}
          </p>
        </div>
      </body>
    </html>
  `;
}

// Log an alert attempt to the database
async function logAlert(logId: string, recipientEmail: string, status: 'sent' | 'failed'): Promise<void> {
  const { error } = await supabase
    .from('databridge_alerts')
    .insert({
      log_id: logId,
      recipient_email: recipientEmail,
      status,
      alert_type: 'sync_failure'
    });

  if (error) {
    console.error('Error logging alert:', error);
  }
}

// Send email alert for a failed sync
async function sendSyncAlert(failure: FailedSync, recipients: AlertRecipient[]): Promise<void> {
  const subject = `[HaaLO Alert] DataBridge Sync Failed: ${failure.origin_module || failure.module_name} → ${failure.target_module || 'Unknown'}`;
  const emailBody = generateEmailBody(failure);

  // Send email to each recipient
  for (const recipient of recipients) {
    try {
      const emailResponse = await resend.emails.send({
        from: 'HaaLO DataBridge <alerts@easeworks.com>',
        to: [recipient.email],
        subject: subject,
        html: emailBody,
        replyTo: 'ops@easeworks.com',
      });

      console.log(`Alert sent successfully to ${recipient.email} for sync ${failure.id}:`, emailResponse);
      await logAlert(failure.id, recipient.email, 'sent');

    } catch (emailError) {
      console.error(`Failed to send alert to ${recipient.email}:`, emailError);
      await logAlert(failure.id, recipient.email, 'failed');
    }
  }
}

// Main alert processing function
async function processAlerts(): Promise<{ processed: number; alerted: number; errors: number }> {
  const recipients = getRecipients();
  const results = { processed: 0, alerted: 0, errors: 0 };

  try {
    const failures = await getUnalertedFailures();
    results.processed = failures.length;

    if (failures.length === 0) {
      console.log('No unalerted sync failures found');
      return results;
    }

    console.log(`Processing ${failures.length} unalerted sync failures`);

    for (const failure of failures) {
      try {
        await sendSyncAlert(failure, recipients);
        results.alerted++;
      } catch (error) {
        console.error(`Failed to process alert for sync ${failure.id}:`, error);
        results.errors++;
      }
    }

    console.log(`Alert processing complete: ${results.alerted} sent, ${results.errors} errors`);
    return results;

  } catch (error) {
    console.error('Error in processAlerts:', error);
    throw error;
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('DataBridge Alert Engine: Starting alert processing...');
    
    const results = await processAlerts();
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Alert processing completed',
      results
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error in databridge-alerts function:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);