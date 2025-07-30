import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncContactsRequest {
  leadIds: string[];
  listId: string;
  tags?: string[];
  action: 'subscribe' | 'unsubscribe' | 'update';
}

interface MailchimpMemberData {
  email_address: string;
  status: string;
  merge_fields: {
    FNAME?: string;
    LNAME?: string;
    PHONE?: string;
    COMPANY?: string;
  };
  tags?: string[];
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

    const { leadIds, listId, tags, action }: SyncContactsRequest = await req.json();

    if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0 || !listId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: leadIds (array), listId' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Get leads from database
    const { data: leads, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .in('id', leadIds);

    if (leadsError || !leads || leads.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No leads found' }),
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
        purpose: 'mailchimp_contacts_sync'
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

    const syncResults = [];

    for (const lead of leads) {
      try {
        if (!lead.email) {
          syncResults.push({
            lead_id: lead.id,
            success: false,
            error: 'Lead has no email address'
          });
          continue;
        }

        // Prepare member data for Mailchimp
        const memberData: MailchimpMemberData = {
          email_address: lead.email,
          status: action === 'unsubscribe' ? 'unsubscribed' : 'subscribed',
          merge_fields: {
            FNAME: lead.first_name || '',
            LNAME: lead.last_name || '',
            PHONE: lead.phone || '',
            COMPANY: lead.company || ''
          }
        };

        if (tags && tags.length > 0) {
          memberData.tags = tags;
        }

        // Check if member already exists
        const memberHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(lead.email.toLowerCase()));
        const memberHashHex = Array.from(new Uint8Array(memberHash))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');

        const existingMemberResponse = await fetch(`${mailchimpApiUrl}/lists/${listId}/members/${memberHashHex}`, {
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (existingMemberResponse.ok) {
          // Member exists, update
          const updateResponse = await fetch(`${mailchimpApiUrl}/lists/${listId}/members/${memberHashHex}`, {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(memberData)
          });

          if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error(`Failed to update member ${lead.email}:`, errorText);
            syncResults.push({
              lead_id: lead.id,
              success: false,
              error: 'Failed to update member in Mailchimp'
            });
            continue;
          }

          const updatedMember = await updateResponse.json();

          // Update local lead with Mailchimp data
          await supabase
            .from('leads')
            .update({
              mailchimp_member_id: updatedMember.id,
              mailchimp_status: updatedMember.status,
              mailchimp_tags: tags || lead.mailchimp_tags || [],
              updated_at: new Date().toISOString()
            })
            .eq('id', lead.id);

          syncResults.push({
            lead_id: lead.id,
            success: true,
            action: 'updated',
            mailchimp_member_id: updatedMember.id,
            status: updatedMember.status
          });

        } else if (existingMemberResponse.status === 404) {
          // Member doesn't exist, create new
          const createResponse = await fetch(`${mailchimpApiUrl}/lists/${listId}/members`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(memberData)
          });

          if (!createResponse.ok) {
            const errorText = await createResponse.text();
            console.error(`Failed to create member ${lead.email}:`, errorText);
            syncResults.push({
              lead_id: lead.id,
              success: false,
              error: 'Failed to create member in Mailchimp'
            });
            continue;
          }

          const newMember = await createResponse.json();

          // Update local lead with Mailchimp data
          await supabase
            .from('leads')
            .update({
              mailchimp_member_id: newMember.id,
              mailchimp_status: newMember.status,
              mailchimp_tags: tags || [],
              updated_at: new Date().toISOString()
            })
            .eq('id', lead.id);

          syncResults.push({
            lead_id: lead.id,
            success: true,
            action: 'created',
            mailchimp_member_id: newMember.id,
            status: newMember.status
          });

        } else {
          // Other error
          const errorText = await existingMemberResponse.text();
          console.error(`Error checking member ${lead.email}:`, errorText);
          syncResults.push({
            lead_id: lead.id,
            success: false,
            error: 'Failed to check member status in Mailchimp'
          });
        }

        // Add tags if specified and member was successfully synced
        if (tags && tags.length > 0 && syncResults[syncResults.length - 1].success) {
          const tagResponse = await fetch(`${mailchimpApiUrl}/lists/${listId}/members/${memberHashHex}/tags`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${access_token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              tags: tags.map(tag => ({ name: tag, status: 'active' }))
            })
          });

          if (!tagResponse.ok) {
            console.error(`Failed to add tags for member ${lead.email}`);
          }
        }

      } catch (error) {
        console.error(`Error syncing lead ${lead.id}:`, error);
        syncResults.push({
          lead_id: lead.id,
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
        synced_contacts: successCount,
        failed_contacts: failureCount,
        results: syncResults
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in mailchimp-sync-contacts function:', error);
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
