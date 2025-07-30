import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🎯 HubSpot Company Webhook received');
    console.log('📋 Request method:', req.method);
    console.log('🔗 Request URL:', req.url);

    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405, 
        headers: corsHeaders 
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const body = await req.json();
    console.log('📦 Webhook payload:', JSON.stringify(body, null, 2));

    // HubSpot webhook format - can be single event or array
    const events = Array.isArray(body) ? body : [body];
    
    for (const event of events) {
      console.log(`🔄 Processing event: ${event.eventType || 'unknown'}`);
      
      // Handle company creation/update events
      if (event.eventType && (
        event.eventType.includes('company.creation') || 
        event.eventType.includes('company.propertyChange')
      )) {
        
        const objectId = event.objectId;
        if (!objectId) {
          console.warn('⚠️ No objectId in webhook event');
          continue;
        }

        // Get company data from the event or fetch from HubSpot
        let companyData;
        
        if (event.properties) {
          // Properties included in webhook
          companyData = event.properties;
        } else {
          // Fetch company data from HubSpot API
          const HUBSPOT_TOKEN = Deno.env.get('HUBSPOT_PRIVATE_APP_TOKEN');
          if (!HUBSPOT_TOKEN) {
            console.error('❌ HubSpot API token not configured');
            continue;
          }

          const hubspotResponse = await fetch(
            `https://api.hubapi.com/crm/v3/objects/companies/${objectId}?properties=name,domain,website,description,industry,phone,address,city,state,country,zip,hs_lead_status`,
            {
              headers: {
                'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (!hubspotResponse.ok) {
            console.error(`❌ Failed to fetch company ${objectId} from HubSpot`);
            continue;
          }

          const hubspotData = await hubspotResponse.json();
          companyData = hubspotData.properties;
        }

        // Validate required fields
        if (!companyData?.name) {
          console.warn('⚠️ Missing required field: company name');
          continue;
        }

        // Map HubSpot data to our schema
        const companyRecord = {
          company_name: companyData.name,
          website: companyData.website || companyData.domain || null,
          description: companyData.description || null,
          industry: companyData.industry || null,
          phone: companyData.phone || null,
          address: companyData.address || null,
          city: companyData.city || null,
          state: companyData.state || null,
          country: companyData.country || 'United States',
          postal_code: companyData.zip || null,
          lifecycle_stage: companyData.hs_lead_status || 'lead',
          primary_color: '#655DC6' // Default color
        };

        console.log('💾 Inserting company:', companyRecord.company_name);

        // Insert or update company in database
        const { data, error } = await supabase
          .from('company_settings')
          .upsert(companyRecord, {
            onConflict: 'company_name',
            ignoreDuplicates: false
          })
          .select('id, company_name');

        if (error) {
          console.error('❌ Database operation failed:', error);
          // Continue processing other events even if one fails
        } else {
          console.log(`✅ Successfully processed company: ${companyRecord.company_name}`);
        }
      } else {
        console.log(`ℹ️ Ignoring event type: ${event.eventType || 'unknown'}`);
      }
    }

    // Return success response within HubSpot's 5-second timeout
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Webhook processed successfully',
        processed: events.length 
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('💥 Webhook processing failed:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Webhook processing failed',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});