import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { integrationId, apiKey } = await req.json();
    
    console.log('🔄 Syncing API key to edge functions for integration:', integrationId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get integration details
    const { data: integration, error } = await supabase
      .from('integrations')
      .select(`
        id,
        name,
        provider:integration_providers(name, display_name)
      `)
      .eq('id', integrationId)
      .single();

    if (error || !integration) {
      throw new Error(`Integration not found: ${error?.message}`);
    }

    const providerName = integration.provider.name.toUpperCase();
    const secretName = `${providerName}_API_KEY`;

    console.log('🔑 Setting secret:', secretName);

    // Call Supabase Management API to set the secret
    const managementResponse = await fetch(
      `https://api.supabase.com/v1/projects/${Deno.env.get('SUPABASE_PROJECT_ID')}/secrets`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ACCESS_TOKEN')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [secretName]: apiKey
        }),
      }
    );

    if (!managementResponse.ok) {
      const errorData = await managementResponse.text();
      console.error('❌ Failed to set secret:', errorData);
      throw new Error(`Failed to sync API key: ${managementResponse.status}`);
    }

    console.log('✅ API key synced successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${integration.provider.display_name} API key synced to edge functions`,
        secretName 
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('❌ Sync failed:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});