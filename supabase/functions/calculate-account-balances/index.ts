import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header', success: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: { persistSession: false },
        global: { headers: { Authorization: authHeader } },
      }
    );

    if (req.method === 'POST') {
      const { company_id } = await req.json();

      if (!company_id) {
        return new Response(
          JSON.stringify({ error: 'Company ID is required', success: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      console.log(`🚀 Starting balance calculation for company: ${company_id}`);

      // Use the optimized database function directly
      const { data, error } = await supabase.rpc('calculate_account_balances_from_gl', {
        p_company_id: company_id
      });

      if (error) {
        console.error('❌ Database function error:', error);
        return new Response(
          JSON.stringify({ error: error.message, success: false }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      const result = data?.[0];
      const accountsUpdated = result?.accounts_updated || 0;
      const entriesProcessed = result?.total_entries || 0;

      console.log(`✅ Completed: ${accountsUpdated} accounts updated from ${entriesProcessed} entries`);

      return new Response(
        JSON.stringify({
          success: true,
          accounts_updated: accountsUpdated,
          entries_processed: entriesProcessed,
          entries_matched: accountsUpdated,
          message: `Successfully updated ${accountsUpdated} account balances from ${entriesProcessed} general ledger entries`
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed', success: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );

  } catch (error) {
    console.error('💥 Function error:', error);
    return new Response(
      JSON.stringify({
        error: error?.message || 'Internal server error',
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});