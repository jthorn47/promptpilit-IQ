import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncAnalyticsRequest {
  campaignId?: string; // Optional - if not provided, sync all campaigns
}

interface MailchimpReportData {
  id: string;
  campaign_title: string;
  opens: {
    opens_total: number;
    unique_opens: number;
    open_rate: number;
  };
  clicks: {
    clicks_total: number;
    unique_clicks: number;
    click_rate: number;
  };
  bounces: {
    hard_bounces: number;
    soft_bounces: number;
    syntax_errors: number;
  };
  unsubscribed: number;
  forwards: {
    forwards_count: number;
    forwards_opens: number;
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { campaignId }: SyncAnalyticsRequest = await req.json();

    // Get Mailchimp integration credentials
    const { data: integrationData, error: integrationError } = await supabase.functions.invoke('use-integration-credentials', {
      body: {
        sessionToken: req.headers.get('x-integration-session'),
        purpose: 'mailchimp_analytics_sync'
      }
    });

    if (integrationError || !integrationData?.credentials) {
      return new Response(
        JSON.stringify({ error: 'Mailchimp integration not configured or expired' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const { access_token } = integrationData.credentials;
    const serverPrefix = access_token.split('-')[1];
    const mailchimpApiUrl = `https://${serverPrefix}.api.mailchimp.com/3.0`;

    let campaignsToSync = [];

    if (campaignId) {
      // Sync specific campaign
      const { data: campaign, error: campaignError } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('sync_analytics', true)
        .not('mailchimp_campaign_id', 'is', null)
        .single();

      if (campaignError || !campaign) {
        return new Response(
          JSON.stringify({ error: 'Campaign not found or not synced to Mailchimp' }),
          { 
            status: 404, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }

      campaignsToSync = [campaign];
    } else {
      // Sync all campaigns that have analytics enabled and are synced to Mailchimp
      const { data: campaigns, error: campaignsError } = await supabase
        .from('email_campaigns')
        .select('*')
        .eq('sync_analytics', true)
        .not('mailchimp_campaign_id', 'is', null)
        .in('mailchimp_status', ['sent', 'sending']);

      if (campaignsError) {
        console.error('Error fetching campaigns:', campaignsError);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch campaigns' }),
          { 
            status: 500, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }

      campaignsToSync = campaigns || [];
    }

    const syncResults = [];

    for (const campaign of campaignsToSync) {
      try {
        // Get campaign report from Mailchimp
        const reportResponse = await fetch(`${mailchimpApiUrl}/reports/${campaign.mailchimp_campaign_id}`, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!reportResponse.ok) {
          console.error(`Failed to fetch report for campaign ${campaign.mailchimp_campaign_id}`);
          syncResults.push({
            campaign_id: campaign.id,
            success: false,
            error: 'Failed to fetch report from Mailchimp'
          });
          continue;
        }

        const reportData: MailchimpReportData = await reportResponse.json();

        // Calculate rates
        const emailsSent = reportData.opens.unique_opens + reportData.bounces.hard_bounces + reportData.bounces.soft_bounces + reportData.bounces.syntax_errors;
        const totalBounces = reportData.bounces.hard_bounces + reportData.bounces.soft_bounces + reportData.bounces.syntax_errors;
        
        const opensRate = emailsSent > 0 ? reportData.opens.open_rate : 0;
        const clicksRate = emailsSent > 0 ? reportData.clicks.click_rate : 0;
        const bounceRate = emailsSent > 0 ? (totalBounces / emailsSent) : 0;
        const unsubscribeRate = emailsSent > 0 ? (reportData.unsubscribed / emailsSent) : 0;

        // Update or insert analytics data
        const { error: upsertError } = await supabase
          .from('mailchimp_analytics')
          .upsert({
            campaign_id: campaign.id,
            mailchimp_campaign_id: campaign.mailchimp_campaign_id,
            opens: reportData.opens.unique_opens,
            clicks: reportData.clicks.unique_clicks,
            bounces: totalBounces,
            unsubscribes: reportData.unsubscribed,
            forwards: reportData.forwards.forwards_count,
            opens_rate: opensRate,
            clicks_rate: clicksRate,
            bounce_rate: bounceRate,
            unsubscribe_rate: unsubscribeRate,
            list_stats: {
              emails_sent: emailsSent,
              total_opens: reportData.opens.opens_total,
              total_clicks: reportData.clicks.clicks_total,
              forwards_opens: reportData.forwards.forwards_opens
            },
            last_synced_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'campaign_id'
          });

        if (upsertError) {
          console.error(`Failed to update analytics for campaign ${campaign.id}:`, upsertError);
          syncResults.push({
            campaign_id: campaign.id,
            success: false,
            error: 'Failed to update analytics in database'
          });
        } else {
          // Update campaign with latest analytics
          await supabase
            .from('email_campaigns')
            .update({
              opens: reportData.opens.unique_opens,
              clicks: reportData.clicks.unique_clicks,
              bounces: totalBounces,
              unsubscribes: reportData.unsubscribed,
              updated_at: new Date().toISOString()
            })
            .eq('id', campaign.id);

          syncResults.push({
            campaign_id: campaign.id,
            success: true,
            analytics: {
              opens: reportData.opens.unique_opens,
              clicks: reportData.clicks.unique_clicks,
              bounces: totalBounces,
              unsubscribes: reportData.unsubscribed,
              opens_rate: opensRate,
              clicks_rate: clicksRate,
              bounce_rate: bounceRate,
              unsubscribe_rate: unsubscribeRate
            }
          });
        }

      } catch (error) {
        console.error(`Error syncing analytics for campaign ${campaign.id}:`, error);
        syncResults.push({
          campaign_id: campaign.id,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = syncResults.filter(r => r.success).length;
    const failureCount = syncResults.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({ 
        success: true,
        synced_campaigns: successCount,
        failed_campaigns: failureCount,
        results: syncResults
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in mailchimp-sync-analytics function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);