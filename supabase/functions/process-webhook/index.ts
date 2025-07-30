import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  integration_id: string;
  provider: string;
  event_type: string;
  data: any;
  headers: Record<string, string>;
  webhook_secret?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const integration_id = url.searchParams.get('integration_id');
    
    // Handle both direct webhook calls (with URL params) and internal test calls (JSON body)
    if (!integration_id) {
      // Try to get integration_id from JSON body for test calls
      try {
        const testPayload = await req.json();
        if (testPayload.integration_id) {
          // Handle internal test format
          return await handleTestWebhook(testPayload, supabase);
        }
      } catch (e) {
        // Not JSON, continue with error
      }
      
      return new Response(
        JSON.stringify({ error: 'Missing integration_id parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the integration details - use service role to bypass RLS
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .select('*, provider:integration_providers(name)')
      .eq('id', integration_id)
      .maybeSingle();

    if (integrationError) {
      console.error('Database error:', integrationError);
      return new Response(
        JSON.stringify({ error: 'Database error', details: integrationError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!integration) {
      console.error('Integration not found for ID:', integration_id);
      return new Response(
        JSON.stringify({ error: 'Integration not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const provider = integration.provider?.name || 'unknown';
    let rawData, event_type;
    
    // Parse request based on content type
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      rawData = await req.json();
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      rawData = Object.fromEntries(formData);
    } else {
      rawData = await req.text();
    }

    // Extract event type based on provider
    if (provider === 'hubspot') {
      // HubSpot sends subscription type in the first element of the array
      event_type = Array.isArray(rawData) && rawData.length > 0 
        ? rawData[0].subscriptionType 
        : 'unknown';
    } else {
      event_type = rawData.type || 'unknown';
    }

    const requestHeaders = Object.fromEntries(req.headers.entries());

    console.log(`Processing webhook for integration ${integration_id}, provider: ${provider}, event: ${event_type}`);

    // Check rate limits
    const { data: rateLimitCheck } = await supabase.rpc('check_rate_limit', {
      p_integration_id: integration_id,
      p_limit_type: 'webhooks_per_minute'
    });

    if (!rateLimitCheck) {
      console.error('Rate limit exceeded for integration:', integration_id);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create webhook log entry
    const webhookLogData = {
      integration_id,
      webhook_url: integration.webhook_url || req.url,
      event_type,
      payload: rawData,
      headers: requestHeaders,
      status: 'processing',
      attempt_number: 1,
      max_attempts: 3,
      scheduled_for: new Date().toISOString(),
      received_at: new Date().toISOString()
    };

    const { data: webhookLog, error: logError } = await supabase
      .from('webhook_logs')
      .insert(webhookLogData)
      .select()
      .single();

    if (logError) {
      console.error('Error creating webhook log:', logError);
      throw logError;
    }

    // Process webhook based on provider
    let processedData;
    try {
      processedData = await processWebhookByProvider(provider, event_type, rawData, supabase);
      
      // Update webhook log as successful
      await supabase
        .from('webhook_logs')
        .update({ 
          status: 'success', 
          response_data: processedData,
          processed_at: new Date().toISOString()
        })
        .eq('id', webhookLog.id);

      console.log(`Webhook processed successfully for integration ${integration_id}`);

    } catch (error) {
      console.error('Error processing webhook:', error);
      
      // Update webhook log as failed
      await supabase
        .from('webhook_logs')
        .update({ 
          status: 'failed', 
          error_message: error.message,
          processed_at: new Date().toISOString()
        })
        .eq('id', webhookLog.id);

      // Create security event for failed webhook
      await supabase
        .from('security_events')
        .insert({
          integration_id,
          event_type: 'webhook_processing_failed',
          severity: 'medium',
          description: `Webhook processing failed: ${error.message}`,
          request_details: { event_type, provider },
          response_details: { error: error.message }
        });

      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, processed_data: processedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Handle internal test webhook calls
async function handleTestWebhook(payload: WebhookPayload, supabase: any) {
  try {
    console.log('Processing test webhook:', payload);
    
    // Create webhook log entry for test
    const webhookLogData = {
      integration_id: payload.integration_id,
      webhook_url: 'internal_test',
      event_type: payload.event_type,
      payload: payload.data,
      headers: payload.headers,
      status: 'processing',
      attempt_number: 1,
      max_attempts: 3,
      scheduled_for: new Date().toISOString(),
      received_at: new Date().toISOString()
    };

    const { data: webhookLog, error: logError } = await supabase
      .from('webhook_logs')
      .insert(webhookLogData)
      .select()
      .single();

    if (logError) {
      console.error('Error creating test webhook log:', logError);
      throw logError;
    }

    // Process the test webhook
    const processedData = await processWebhookByProvider(payload.provider, payload.event_type, payload.data, supabase);
    
    // Update webhook log as successful
    await supabase
      .from('webhook_logs')
      .update({ 
        status: 'success', 
        response_data: processedData,
        processed_at: new Date().toISOString()
      })
      .eq('id', webhookLog.id);

    return new Response(
      JSON.stringify({ success: true, message: 'Test webhook processed successfully', processed_data: processedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Test webhook error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function processWebhookByProvider(provider: string, eventType: string, data: any, supabase: any) {
  switch (provider.toLowerCase()) {
    case 'hubspot':
      return await processHubSpotWebhook(eventType, data, supabase);
    case 'stripe':
      return await processStripeWebhook(eventType, data, supabase);
    case 'slack':
      return await processSlackWebhook(eventType, data, supabase);
    case 'mailchimp':
      return await processMailchimpWebhook(eventType, data, supabase);
    default:
      console.log(`Generic webhook processing for provider: ${provider}`);
      return { processed: true, provider, eventType, dataKeys: Object.keys(data) };
  }
}

async function processHubSpotWebhook(eventType: string, data: any, supabase: any) {
  console.log(`Processing HubSpot webhook: ${eventType}`);
  
  switch (eventType) {
    case 'contact.creation':
    case 'contact.propertyChange':
      // Sync contact data to leads table
      if (data.objectId) {
        const contactData = {
          external_id: data.objectId.toString(),
          first_name: data.properties?.firstname || '',
          last_name: data.properties?.lastname || '',
          email: data.properties?.email || '',
          company_name: data.properties?.company || '',
          source: 'hubspot_webhook',
          status: 'new'
        };

        await supabase
          .from('leads')
          .upsert(contactData, { onConflict: 'external_id' });
      }
      break;
    
    case 'deal.creation':
    case 'deal.propertyChange':
      // Sync deal data
      if (data.objectId) {
        const dealData = {
          external_id: data.objectId.toString(),
          title: data.properties?.dealname || 'HubSpot Deal',
          value: parseFloat(data.properties?.amount || '0'),
          stage_id: null, // Would need mapping logic
          status: data.properties?.dealstage === 'closedwon' ? 'won' : 'open'
        };

        await supabase
          .from('deals')
          .upsert(dealData, { onConflict: 'external_id' });
      }
      break;
  }

  return { processed: true, provider: 'hubspot', eventType, recordId: data.objectId };
}

async function processStripeWebhook(eventType: string, data: any, supabase: any) {
  console.log(`Processing Stripe webhook: ${eventType}`);
  
  switch (eventType) {
    case 'customer.created':
    case 'customer.updated':
      // Sync customer to leads
      const customerData = {
        external_id: data.id,
        first_name: data.name?.split(' ')[0] || '',
        last_name: data.name?.split(' ').slice(1).join(' ') || '',
        email: data.email || '',
        source: 'stripe_webhook',
        status: 'customer'
      };

      await supabase
        .from('leads')
        .upsert(customerData, { onConflict: 'external_id' });
      break;

    case 'invoice.payment_succeeded':
      // Create deal for successful payment
      const dealData = {
        external_id: data.id,
        title: `Stripe Payment - ${data.number}`,
        value: data.amount_paid / 100, // Convert cents to dollars
        status: 'won',
        company_name: data.customer_name || ''
      };

      await supabase
        .from('deals')
        .upsert(dealData, { onConflict: 'external_id' });
      break;
  }

  return { processed: true, provider: 'stripe', eventType, recordId: data.id };
}

async function processSlackWebhook(eventType: string, data: any, supabase: any) {
  console.log(`Processing Slack webhook: ${eventType}`);
  
  // Handle Slack events (messages, mentions, etc.)
  if (eventType === 'message' && data.text) {
    // Could create activities from Slack messages
    const activityData = {
      type: 'slack_message',
      subject: 'Slack Message',
      description: data.text,
      assigned_to: null, // Would need user mapping
      created_by: null,
      status: 'completed'
    };

    // Only create if we can map to a user
    if (data.user) {
      // Would need logic to map Slack user to system user
    }
  }

  return { processed: true, provider: 'slack', eventType };
}

async function processMailchimpWebhook(eventType: string, data: any, supabase: any) {
  console.log(`Processing Mailchimp webhook: ${eventType}`);
  
  switch (eventType) {
    case 'subscribe':
    case 'unsubscribe':
    case 'profile':
      // Sync subscriber data to leads
      const subscriberData = {
        external_id: data.id || data.email,
        first_name: data.merges?.FNAME || '',
        last_name: data.merges?.LNAME || '',
        email: data.email,
        source: 'mailchimp_webhook',
        status: eventType === 'subscribe' ? 'subscribed' : 'unsubscribed'
      };

      await supabase
        .from('leads')
        .upsert(subscriberData, { onConflict: 'external_id' });
      break;

    case 'campaign':
      // Track email campaign events
      console.log('Mailchimp campaign event:', data);
      break;
  }

  return { processed: true, provider: 'mailchimp', eventType, email: data.email };
}