import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncCampaignRequest {
  campaignId: string;
  listId: string;
  action: 'create' | 'send' | 'schedule';
  scheduleTime?: string;
}

interface MailchimpCampaignData {
  type: string;
  recipients: {
    list_id: string;
  };
  settings: {
    subject_line: string;
    title: string;
    from_name: string;
    reply_to: string;
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

    const { campaignId, listId, action, scheduleTime }: SyncCampaignRequest = await req.json();

    if (!campaignId || !listId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: campaignId, listId' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Get campaign details from database
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single();

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ error: 'Campaign not found' }),
        { 
          status: 404, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Get Mailchimp integration credentials
    const { data: integrationData, error: integrationError } = await supabase.functions.invoke('use-integration-credentials', {
      body: {
        sessionToken: req.headers.get('x-integration-session'),
        purpose: 'mailchimp_campaign_sync'
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

    if (action === 'create') {
      // Create campaign in Mailchimp
      const campaignData: MailchimpCampaignData = {
        type: 'regular',
        recipients: {
          list_id: listId
        },
        settings: {
          subject_line: campaign.subject || 'Email Campaign',
          title: campaign.name || 'Campaign',
          from_name: 'Marketing Team',
          reply_to: 'noreply@company.com'
        }
      };

      const createResponse = await fetch(`${mailchimpApiUrl}/campaigns`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(campaignData)
      });

      if (!createResponse.ok) {
        const errorText = await createResponse.text();
        console.error('Mailchimp campaign creation failed:', errorText);
        
        return new Response(
          JSON.stringify({ 
            error: 'Failed to create campaign in Mailchimp',
            details: errorText
          }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }

      const mailchimpCampaign = await createResponse.json();

      // Set campaign content
      const contentResponse = await fetch(`${mailchimpApiUrl}/campaigns/${mailchimpCampaign.id}/content`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          html: campaign.content || '<p>Campaign content</p>'
        })
      });

      if (!contentResponse.ok) {
        console.error('Failed to set campaign content');
      }

      // Update local campaign with Mailchimp ID
      const { error: updateError } = await supabase
        .from('email_campaigns')
        .update({
          mailchimp_campaign_id: mailchimpCampaign.id,
          mailchimp_list_id: listId,
          mailchimp_status: 'draft',
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (updateError) {
        console.error('Failed to update campaign in database:', updateError);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          mailchimp_campaign_id: mailchimpCampaign.id,
          status: 'created'
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );

    } else if (action === 'send') {
      if (!campaign.mailchimp_campaign_id) {
        return new Response(
          JSON.stringify({ error: 'Campaign not synced to Mailchimp yet' }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }

      // Send campaign immediately
      const sendResponse = await fetch(`${mailchimpApiUrl}/campaigns/${campaign.mailchimp_campaign_id}/actions/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!sendResponse.ok) {
        const errorText = await sendResponse.text();
        console.error('Mailchimp campaign send failed:', errorText);
        
        return new Response(
          JSON.stringify({ 
            error: 'Failed to send campaign via Mailchimp',
            details: errorText
          }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }

      // Update local campaign status
      const { error: updateError } = await supabase
        .from('email_campaigns')
        .update({
          mailchimp_status: 'sent',
          status: 'sent',
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (updateError) {
        console.error('Failed to update campaign status in database:', updateError);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          status: 'sent'
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );

    } else if (action === 'schedule' && scheduleTime) {
      if (!campaign.mailchimp_campaign_id) {
        return new Response(
          JSON.stringify({ error: 'Campaign not synced to Mailchimp yet' }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }

      // Schedule campaign
      const scheduleResponse = await fetch(`${mailchimpApiUrl}/campaigns/${campaign.mailchimp_campaign_id}/actions/schedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          schedule_time: scheduleTime
        })
      });

      if (!scheduleResponse.ok) {
        const errorText = await scheduleResponse.text();
        console.error('Mailchimp campaign schedule failed:', errorText);
        
        return new Response(
          JSON.stringify({ 
            error: 'Failed to schedule campaign via Mailchimp',
            details: errorText
          }),
          { 
            status: 400, 
            headers: { 'Content-Type': 'application/json', ...corsHeaders } 
          }
        );
      }

      // Update local campaign status
      const { error: updateError } = await supabase
        .from('email_campaigns')
        .update({
          mailchimp_status: 'scheduled',
          status: 'scheduled',
          scheduled_at: scheduleTime,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (updateError) {
        console.error('Failed to update campaign status in database:', updateError);
      }

      return new Response(
        JSON.stringify({ 
          success: true,
          status: 'scheduled',
          scheduled_at: scheduleTime
        }),
        { 
          status: 200, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action specified' }),
      { 
        status: 400, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in mailchimp-sync-campaign function:', error);
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