import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MailchimpList {
  id: string;
  name: string;
  contact: {
    company: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  stats: {
    member_count: number;
    total_contacts: number;
    unsubscribe_count: number;
    cleaned_count: number;
    member_count_since_send: number;
    unsubscribe_count_since_send: number;
    cleaned_count_since_send: number;
    campaign_count: number;
    campaign_last_sent: string;
    merge_field_count: number;
    avg_sub_rate: number;
    avg_unsub_rate: number;
    target_sub_rate: number;
    open_rate: number;
    click_rate: number;
    last_sub_date: string;
    last_unsub_date: string;
  };
  date_created: string;
  list_rating: number;
  subscribe_url_short: string;
  subscribe_url_long: string;
  beamer_address: string;
  visibility: string;
  double_optin: boolean;
  has_welcome: boolean;
  marketing_permissions: boolean;
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

    // Get Mailchimp integration credentials
    const { data: integrationData, error: integrationError } = await supabase.functions.invoke('use-integration-credentials', {
      body: {
        sessionToken: req.headers.get('x-integration-session'),
        purpose: 'mailchimp_lists_fetch'
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

    // Get all lists from Mailchimp
    const listsResponse = await fetch(`${mailchimpApiUrl}/lists?count=100`, {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!listsResponse.ok) {
      const errorText = await listsResponse.text();
      console.error('Mailchimp lists fetch failed:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch lists from Mailchimp',
          details: errorText
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const listsData = await listsResponse.json();
    const lists: MailchimpList[] = listsData.lists || [];

    // Format lists for frontend consumption
    const formattedLists = lists.map(list => ({
      id: list.id,
      name: list.name,
      member_count: list.stats.member_count,
      total_contacts: list.stats.total_contacts,
      unsubscribe_count: list.stats.unsubscribe_count,
      cleaned_count: list.stats.cleaned_count,
      campaign_count: list.stats.campaign_count,
      open_rate: list.stats.open_rate,
      click_rate: list.stats.click_rate,
      avg_sub_rate: list.stats.avg_sub_rate,
      avg_unsub_rate: list.stats.avg_unsub_rate,
      date_created: list.date_created,
      list_rating: list.list_rating,
      subscribe_url_short: list.subscribe_url_short,
      visibility: list.visibility,
      double_optin: list.double_optin,
      has_welcome: list.has_welcome,
      marketing_permissions: list.marketing_permissions,
      contact: {
        company: list.contact.company,
        city: list.contact.city,
        state: list.contact.state,
        country: list.contact.country
      },
      last_activity: {
        last_sub_date: list.stats.last_sub_date,
        last_unsub_date: list.stats.last_unsub_date,
        campaign_last_sent: list.stats.campaign_last_sent
      }
    }));

    return new Response(
      JSON.stringify({ 
        success: true,
        lists: formattedLists,
        total_lists: lists.length
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in mailchimp-get-lists function:', error);
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