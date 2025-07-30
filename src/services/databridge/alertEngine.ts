import { supabase } from '@/integrations/supabase/client';

export interface FailedSync {
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

export interface AlertRecipient {
  email: string;
  name?: string;
}

/**
 * DataBridge Alert Engine
 * Monitors failed and stale syncs and sends email alerts
 */
export class DataBridgeAlertEngine {
  private static readonly DEFAULT_RECIPIENTS: AlertRecipient[] = [
    { email: 'jeffrey@easeworks.com', name: 'Jeffrey' },
    { email: 'ops@easeworks.com', name: 'Operations Team' }
  ];

  /**
   * Get failed and stale syncs that haven't been alerted yet
   */
  static async getUnalertedFailures(): Promise<FailedSync[]> {
    try {
      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

      const { data: failures, error } = await supabase
        .from('databridge_logs')
        .select('*')
        .or(`status.eq.error,and(status.eq.stale,last_synced_at.lt.${fifteenMinutesAgo})`)
        .not('id', 'in', `(
          SELECT log_id FROM databridge_alerts 
          WHERE status = 'sent' AND created_at > now() - interval '24 hours'
        )`);

      if (error) throw error;
      return failures as FailedSync[];
    } catch (error) {
      console.error('Error fetching unalerted failures:', error);
      throw error;
    }
  }

  /**
   * Send email alert for a failed sync
   */
  static async sendSyncAlert(failure: FailedSync, recipients: AlertRecipient[]): Promise<void> {
    try {
      const subject = `[HaaLO Alert] DataBridge Sync Failed: ${failure.origin_module || failure.module_name} → ${failure.target_module || 'Unknown'}`;
      
      const emailBody = this.generateEmailBody(failure);

      // Send email to each recipient
      for (const recipient of recipients) {
        try {
          const { error: emailError } = await supabase.functions.invoke('send-email', {
            body: {
              to: recipient.email,
              subject,
              html: emailBody,
              from_name: 'HaaLO DataBridge',
              from_email: 'alerts@easeworks.com',
              reply_to: 'ops@easeworks.com'
            }
          });

          if (emailError) throw emailError;

          // Log successful alert
          await this.logAlert(failure.id, recipient.email, 'sent');
          console.log(`Alert sent successfully to ${recipient.email} for sync ${failure.id}`);

        } catch (emailError) {
          console.error(`Failed to send alert to ${recipient.email}:`, emailError);
          await this.logAlert(failure.id, recipient.email, 'failed');
        }
      }
    } catch (error) {
      console.error('Error sending sync alert:', error);
      throw error;
    }
  }

  /**
   * Generate HTML email body for sync failure alert
   */
  private static generateEmailBody(failure: FailedSync): string {
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

  /**
   * Log an alert attempt to the database
   */
  private static async logAlert(logId: string, recipientEmail: string, status: 'sent' | 'failed'): Promise<void> {
    try {
      const { error } = await supabase
        .from('databridge_alerts')
        .insert({
          log_id: logId,
          recipient_email: recipientEmail,
          status,
          alert_type: 'sync_failure'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging alert:', error);
      // Don't throw here to avoid breaking the main alert flow
    }
  }

  /**
   * Process all unalerted failures and send alerts
   */
  static async processAlerts(customRecipients?: AlertRecipient[]): Promise<{
    processed: number;
    alerted: number;
    errors: number;
  }> {
    const recipients = customRecipients || this.DEFAULT_RECIPIENTS;
    const results = { processed: 0, alerted: 0, errors: 0 };

    try {
      const failures = await this.getUnalertedFailures();
      results.processed = failures.length;

      if (failures.length === 0) {
        console.log('No unalerted sync failures found');
        return results;
      }

      console.log(`Processing ${failures.length} unalerted sync failures`);

      for (const failure of failures) {
        try {
          await this.sendSyncAlert(failure, recipients);
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

  /**
   * Get alert statistics for monitoring
   */
  static async getAlertStats(days: number = 7): Promise<{
    totalAlerts: number;
    successfulAlerts: number;
    failedAlerts: number;
    recentFailures: number;
  }> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

      const [alertsResult, failuresResult] = await Promise.all([
        supabase
          .from('databridge_alerts')
          .select('status')
          .gte('created_at', startDate),
        supabase
          .from('databridge_logs')
          .select('id')
          .in('status', ['error', 'stale'])
          .gte('created_at', startDate)
      ]);

      if (alertsResult.error) throw alertsResult.error;
      if (failuresResult.error) throw failuresResult.error;

      const alerts = alertsResult.data || [];
      const failures = failuresResult.data || [];

      return {
        totalAlerts: alerts.length,
        successfulAlerts: alerts.filter(a => a.status === 'sent').length,
        failedAlerts: alerts.filter(a => a.status === 'failed').length,
        recentFailures: failures.length
      };
    } catch (error) {
      console.error('Error getting alert stats:', error);
      throw error;
    }
  }
}