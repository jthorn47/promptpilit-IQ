import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

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
          JSON.stringify({ error: 'Company ID is required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      console.log(`🔍 Debugging account matching for company: ${company_id}`);

      // Get sample of chart of accounts
      const { data: chartAccounts, error: chartError } = await supabase
        .from('chart_of_accounts')
        .select('id, account_number, full_name, current_balance')
        .eq('company_id', company_id)
        .limit(10);

      if (chartError) {
        console.error('Chart of accounts error:', chartError);
        return new Response(
          JSON.stringify({ error: chartError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Get sample of general ledger entries
      const { data: glEntries, error: glError } = await supabase
        .from('general_ledger')
        .select('id, account_name, split_account, name, amount')
        .eq('company_id', company_id)
        .limit(20);

      if (glError) {
        console.error('General ledger error:', glError);
        return new Response(
          JSON.stringify({ error: glError.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      // Get unique account names from general ledger
      const { data: uniqueAccounts, error: uniqueError } = await supabase
        .from('general_ledger')
        .select('account_name, split_account')
        .eq('company_id', company_id)
        .limit(50);

      const uniqueAccountNames = new Set();
      uniqueAccounts?.forEach(entry => {
        if (entry.account_name) uniqueAccountNames.add(entry.account_name);
        if (entry.split_account) uniqueAccountNames.add(entry.split_account);
      });

      console.log(`📊 Found ${chartAccounts?.length || 0} chart accounts and ${glEntries?.length || 0} GL entries`);
      console.log(`🎯 Unique account names in GL: ${uniqueAccountNames.size}`);

      return new Response(
        JSON.stringify({
          success: true,
          summary: {
            chart_accounts_count: chartAccounts?.length || 0,
            gl_entries_count: glEntries?.length || 0,
            unique_gl_account_names: uniqueAccountNames.size
          },
          sample_chart_accounts: chartAccounts,
          sample_gl_entries: glEntries,
          unique_gl_account_names: Array.from(uniqueAccountNames).slice(0, 20),
          matching_analysis: {
            message: "Check if GL account names match chart of accounts names",
            instructions: "Look for patterns like account numbers, spaces, or formatting differences"
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    );

  } catch (error) {
    console.error('Debug function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});