import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CredentialRequest {
  integrationName: string
  companyId: string
  credentialType: string // 'api_key', 'oauth', 'basic_auth', etc.
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { integrationName, companyId, credentialType }: CredentialRequest = await req.json()
    
    console.log(`🔐 Retrieving credentials for ${integrationName}`)
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )
    
    // Get the credentials from integration_tokens table
    const { data: credentials, error } = await supabase
      .from('integration_tokens')
      .select('*')
      .eq('app_name', integrationName)
      .eq('client_id', companyId)
      .single()
    
    if (error || !credentials) {
      console.warn(`⚠️ No credentials found for ${integrationName}`)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No credentials configured for this integration',
          integrationName,
          hasCredentials: false
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        }
      )
    }
    
    // Check if credentials are expired
    const now = new Date()
    const expiresAt = credentials.expires_at ? new Date(credentials.expires_at) : null
    const isExpired = expiresAt && expiresAt <= now
    
    if (isExpired) {
      console.warn(`⚠️ Credentials expired for ${integrationName}`)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Integration credentials have expired',
          integrationName,
          hasCredentials: true,
          isExpired: true,
          expiresAt: credentials.expires_at
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401 
        }
      )
    }
    
    // Return credential status (not the actual credentials for security)
    return new Response(
      JSON.stringify({
        success: true,
        integrationName,
        hasCredentials: true,
        isExpired: false,
        credentialType: credentials.token_type || credentialType,
        expiresAt: credentials.expires_at,
        lastUsed: credentials.updated_at,
        // Don't return actual tokens for security
        metadata: {
          scopes: credentials.scopes,
          baseUrl: getIntegrationBaseUrl(integrationName)
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
    
  } catch (error) {
    console.error('❌ Failed to retrieve credentials:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

function getIntegrationBaseUrl(integrationName: string): string {
  const baseUrls: Record<string, string> = {
    'quickbooks': 'https://sandbox-quickbooks.api.intuit.com',
    'adp': 'https://api.adp.com',
    'gusto': 'https://api.gusto-demo.com',
    'bamboohr': 'https://api.bamboohr.com',
    'workday': 'https://api.workday.com',
    'paylocity': 'https://api.paylocity.com',
    'paycom': 'https://api.paycom.com',
    'kronos': 'https://api.kronos.com',
    'stripe': 'https://api.stripe.com',
    'plaid': 'https://production.plaid.com'
  }
  
  return baseUrls[integrationName.toLowerCase()] || 'https://api.example.com'
}